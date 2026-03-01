import { NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

type CreateFolderPayload = {
  name?: string;
};

export async function POST(request: Request) {
  const auth = await withRouteAuth(request, { requireAdmin: true });
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as CreateFolderPayload;
    const rawName = body.name?.trim();

    if (!rawName) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const sanitizedName = rawName.replace(/[\\/]+/g, "-");
    const folderFilename = `${sanitizedName}/`;

    const existingFolder = await prisma.document.findFirst({
      where: {
        filename: folderFilename,
        mimeType: "application/x-directory",
      },
      select: { id: true },
    });

    if (existingFolder) {
      return NextResponse.json({ error: "Folder already exists" }, { status: 409 });
    }

    const folder = await prisma.document.create({
      data: {
        filename: folderFilename,
        source: "DIRECT_UPLOAD",
        mimeType: "application/x-directory",
        ingestionStatus: "DONE",
        ingestedAt: new Date(),
      },
    });

    logger.logDb("document.createFolder", {
      documentId: folder.id,
      folderName: folderFilename,
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (err) {
    logger.logApi("error", "/api/admin/folders", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
