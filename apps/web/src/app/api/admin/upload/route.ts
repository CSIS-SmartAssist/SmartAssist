import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        filename: file.name,
        source: "DIRECT_UPLOAD",
        mimeType: file.type,
        ingestionStatus: "PENDING",
      },
    });

    const ragFormData = new FormData();
    ragFormData.append("file", file);
    ragFormData.append("document_id", document.id);

    const ragResponse = await fetch(
      `${process.env.RAG_SERVICE_URL}/rag/ingest/file`,
      {
        method: "POST",
        headers: { "x-internal-secret": process.env.INTERNAL_SECRET! },
        body: ragFormData,
      }
    );

    if (!ragResponse.ok) {
      await prisma.document.update({
        where: { id: document.id },
        data: { ingestionStatus: "FAILED", errorMessage: "RAG service error" },
      });
      return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
    }

    await prisma.document.update({
      where: { id: document.id },
      data: { ingestionStatus: "DONE", ingestedAt: new Date() },
    });

    return NextResponse.json(document, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

