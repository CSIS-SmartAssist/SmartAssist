// POST /api/chat — validates session, persists to DB (conversation + messages), calls RAG
// Body: { message: string, conversationId?: string, title?: string }
// title used only when creating a new conversation (default: first 40 chars of message)

import { NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import { queryRag } from "@/lib/rag-client";
import * as logger from "@/lib/logger";

const ASSISTANT_AUTHOR = "SMART ASSIST AI";
const TITLE_MAX_LEN = 40;

const titleFromMessage = (msg: string): string => {
  const t = msg.trim();
  return t.length > TITLE_MAX_LEN ? `${t.slice(0, TITLE_MAX_LEN)}...` : t || "New chat";
};

// ── Booking helper ─────────────────────────────────────────────────────────────
async function handleBookingRequest(
  params: {
    room_name: string;
    date: string;
    start_time: string;
    end_time: string;
    reason: string;
  },
  userId: string
): Promise<string> {
  // Try exact match first, then partial match
  let room = await prisma.room.findFirst({
    where: { name: { equals: params.room_name, mode: "insensitive" } },
  });

  if (!room) {
    room = await prisma.room.findFirst({
      where: { name: { contains: params.room_name, mode: "insensitive" } },
    });
  }

  if (!room) {
    // Get actual room names from DB for helpful error message
    const allRooms = await prisma.room.findMany({ select: { name: true } });
    const roomNames = allRooms.map((r) => r.name).join(", ");
    return `I couldn't find a room called "${params.room_name}". Available rooms are: ${roomNames}.`;
  }

  const startTime = new Date(`${params.date}T${params.start_time}:00`);
  const endTime = new Date(`${params.date}T${params.end_time}:00`);

  const conflict = await prisma.booking.findFirst({
    where: {
      roomId: room.id,
      status: "APPROVED",
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
  });

  if (conflict) {
    return `Sorry, ${room.name} is already booked during that time. Please choose a different time slot.`;
  }

  await prisma.booking.create({
    data: {
      userId,
      roomId: room.id,
      startTime,
      endTime,
      reason: params.reason,
      status: "PENDING",
    },
  });

  const dateStr = startTime.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `Your booking request for **${room.name}** on **${dateStr}** from **${params.start_time} to ${params.end_time}** has been submitted. Reason: ${params.reason}. An admin will review it shortly.`;
}
// ──────────────────────────────────────────────────────────────────────────────

export const POST = async (request: Request) => {
  const auth = await withRouteAuth(request);
  if (!auth.ok) return auth.response;

  const userId = auth.session.user?.id;
  const userAuthor = (auth.session.user?.name ?? "User").toString().trim() || "User";
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const message = (body?.message as string)?.trim();
    const conversationId = body?.conversationId as string | undefined;
    const titleOverride = typeof body?.title === "string" ? body.title.trim().slice(0, 200) : undefined;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    if (conversationId) {
      const conv = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (!conv) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      let answer: string;
      try {
        const result = await queryRag(message);
        // ── booking intercept ──────────────────────────────────────────────
        if ("type" in result && result.type === "booking_request" && result.params) {
          answer = await handleBookingRequest(result.params, userId);
        } else {
          answer = "answer" in result ? result.answer : "";
        }
        // ──────────────────────────────────────────────────────────────────
      } catch (ragErr) {
        logger.logApi("error", "/api/chat", {
          message: ragErr instanceof Error ? ragErr.message : String(ragErr),
        });
        answer = "I couldn't fetch a response right now. Please try again.";
      }

      await prisma.$transaction([
        prisma.conversationMessage.create({
          data: {
            conversationId,
            role: "USER",
            content: message,
            author: userAuthor,
          },
        }),
        prisma.conversationMessage.create({
          data: {
            conversationId,
            role: "ASSISTANT",
            content: answer,
            author: ASSISTANT_AUTHOR,
          },
        }),
        prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        }),
      ]);
      return NextResponse.json({ answer, conversationId });
    }

    // New conversation
    let answer: string;
    try {
      const result = await queryRag(message);
      // ── booking intercept ────────────────────────────────────────────────
      if ("type" in result && result.type === "booking_request" && result.params) {
        answer = await handleBookingRequest(result.params, userId);
      } else {
        answer = "answer" in result ? result.answer : "";
      }
      // ────────────────────────────────────────────────────────────────────
    } catch (ragErr) {
      logger.logApi("error", "/api/chat", {
        message: ragErr instanceof Error ? ragErr.message : String(ragErr),
      });
      answer = "I couldn't fetch a response right now. Please try again.";
    }

    const title =
      titleOverride && titleOverride.trim() !== "New Chat"
        ? titleOverride.trim().slice(0, 200)
        : titleFromMessage(message);

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title,
        messages: {
          create: [
            { role: "USER", content: message, author: userAuthor },
            { role: "ASSISTANT", content: answer, author: ASSISTANT_AUTHOR },
          ],
        },
      },
    });

    return NextResponse.json({
      answer,
      conversationId: conversation.id,
      title: conversation.title,
    });
  } catch (err) {
    logger.logApi("error", "/api/chat", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
};  