// GET /api/chats — list conversations for current user; optional ?search= for title filter
// POST /api/chats — create a new conversation (optional body: { title?: string })

import { NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

const DEFAULT_TITLE = "New chat";

export const GET = async (request: Request) => {
  const auth = await withRouteAuth(request);
  if (!auth.ok) return auth.response;

  const userId = auth.session.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase();

    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        ...(search
          ? { title: { contains: search, mode: "insensitive" } }
          : {}),
      },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        pinned: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      chats: conversations.map((c) => ({
        id: c.id,
        title: c.title,
        pinned: c.pinned,
        createdAt: c.createdAt.getTime(),
        updatedAt: c.updatedAt.getTime(),
      })),
    });
  } catch (err) {
    logger.logApi("error", "/api/chats", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await withRouteAuth(request);
  if (!auth.ok) return auth.response;

  const userId = auth.session.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let title = DEFAULT_TITLE;
    try {
      const body = await request.json();
      if (typeof body?.title === "string" && body.title.trim()) {
        title = body.title.trim().slice(0, 200);
      }
    } catch {
      // no body or invalid JSON — use default title
    }

    const conversation = await prisma.conversation.create({
      data: { userId, title },
    });

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt.getTime(),
      updatedAt: conversation.updatedAt.getTime(),
    });
  } catch (err) {
    logger.logApi("error", "/api/chats", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
};
