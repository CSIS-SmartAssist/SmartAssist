import { NextRequest, NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

const DEFAULT_RAG_URL = "http://localhost:8000";
const FETCH_TIMEOUT_MS = 45_000;

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const getRagConfig = () => {
  const ragBaseUrl = normalizeBaseUrl(process.env.RAG_SERVICE_URL ?? DEFAULT_RAG_URL);
  const internalSecret = process.env.INTERNAL_SECRET?.trim();

  if (!internalSecret) {
    throw new Error("INTERNAL_SECRET is not configured");
  }

  return { ragBaseUrl, internalSecret };
};

export async function POST(request: NextRequest) {
  const auth = await withRouteAuth(request, { requireAdmin: true });
  if (!auth.ok) return auth.response;

  let createdDocumentId: string | null = null;

  try {
    const formData = await request.formData();
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
    createdDocumentId = document.id;

    const { ragBaseUrl, internalSecret } = getRagConfig();
    logger.logApi("request", "/api/admin/upload", {
      documentId: document.id,
      fileName: file.name,
      ragBaseUrl,
    });

    const ragFormData = new FormData();
    ragFormData.append("file", file);
    ragFormData.append("document_id", document.id);

    const ragResponse = await fetch(`${ragBaseUrl}/rag/ingest/file`, {
      method: "POST",
      headers: { "x-internal-secret": internalSecret },
      body: ragFormData,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!ragResponse.ok) {
      const ragErrorText = await ragResponse.text().catch(() => "");
      const errorMessage = `RAG service error (${ragResponse.status})${ragErrorText ? `: ${ragErrorText.slice(0, 200)}` : ""}`;
      await prisma.document.update({
        where: { id: document.id },
        data: { ingestionStatus: "FAILED", errorMessage },
      });
      logger.logApi("error", "/api/admin/upload", {
        documentId: document.id,
        status: ragResponse.status,
        errorMessage,
      });
      return NextResponse.json({ error: "Ingestion failed", detail: errorMessage }, { status: 500 });
    }

    await prisma.document.update({
      where: { id: document.id },
      data: { ingestionStatus: "DONE", ingestedAt: new Date() },
    });

    logger.logApi("response", "/api/admin/upload", {
      documentId: document.id,
      status: 201,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (err) {
    const failureMessage = err instanceof Error ? err.message : String(err);

    if (createdDocumentId) {
      try {
        await prisma.document.update({
          where: { id: createdDocumentId },
          data: { ingestionStatus: "FAILED", errorMessage: failureMessage.slice(0, 500) },
        });
      } catch (updateErr) {
        logger.logApi("error", "/api/admin/upload", {
          message: updateErr instanceof Error ? updateErr.message : String(updateErr),
          documentId: createdDocumentId,
          context: "Failed to persist FAILED status",
        });
      }
    }

    logger.logApi("error", "/api/admin/upload", {
      message: failureMessage,
      documentId: createdDocumentId,
    });
    return NextResponse.json({ error: "Upload failed", detail: failureMessage }, { status: 500 });
  }
}

