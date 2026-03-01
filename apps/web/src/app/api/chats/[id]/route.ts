// GET /api/chats/[id] — get one conversation with messages (must belong to current user)

import { NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await withRouteAuth(request);
  if (!auth.ok) return auth.response;

  const userId = auth.session.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Conversation id required" }, { status: 400 });
  }

  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            author: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt.getTime(),
      updatedAt: conversation.updatedAt.getTime(),
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role.toLowerCase() as "user" | "assistant",
        content: m.content,
        author: m.author ?? undefined,
        createdAt: m.createdAt.getTime(),
      })),
    });
  } catch (err) {
    logger.logApi("error", "/api/chats/[id]", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
};
