import { NextRequest, NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

const DEFAULT_RAG_URL = "http://localhost:8000";
const FETCH_TIMEOUT_MS = 45_000;
const MAX_ERROR_MESSAGE_LENGTH = 500;
const MAX_REMOTE_ERROR_PREVIEW = 200;

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const buildRagIngestUrl = (baseUrl: string): string => {
  const normalized = normalizeBaseUrl(baseUrl);

  try {
    return new URL("rag/ingest/file", `${normalized}/`).toString();
  } catch {
    throw new Error(`Invalid RAG service URL: ${baseUrl}`);
  }
};

const getRagConfig = () => {
  const configuredRagUrl = process.env.RAG_SERVICE_URL?.trim();
  const ragBaseUrl = normalizeBaseUrl(configuredRagUrl || DEFAULT_RAG_URL);
  const internalSecret = process.env.INTERNAL_SECRET?.trim();

  if (!configuredRagUrl) {
    logger.warn("admin.upload", "RAG_SERVICE_URL missing, using fallback", {
      fallback: DEFAULT_RAG_URL,
    });
  }

  if (!internalSecret) {
    throw new Error("INTERNAL_SECRET is not configured");
  }

  return {
    internalSecret,
    ragIngestUrl: buildRagIngestUrl(ragBaseUrl),
    ragBaseUrl,
  };
};

const toErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};

const toStoredErrorMessage = (message: string): string => {
  return message.slice(0, MAX_ERROR_MESSAGE_LENGTH);
};

export async function POST(request: NextRequest) {
  const auth = await withRouteAuth(request, { requireAdmin: true });
  if (!auth.ok) return auth.response;

  let createdDocumentId: string | null = null;

  try {
    const formData = await request.formData();
    const incomingFile = formData.get("file");

    if (!(incomingFile instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(incomingFile.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const createdDocument = await prisma.document.create({
      data: {
        filename: incomingFile.name,
        source: "DIRECT_UPLOAD",
        mimeType: incomingFile.type,
        ingestionStatus: "PENDING",
      },
    });
    createdDocumentId = createdDocument.id;

    logger.logDb("document.ingestionStatus", {
      documentId: createdDocument.id,
      from: null,
      to: "PENDING",
    });

    await prisma.document.update({
      where: { id: createdDocument.id },
      data: {
        ingestionStatus: "PROCESSING",
        errorMessage: null,
      },
    });

    logger.logDb("document.ingestionStatus", {
      documentId: createdDocument.id,
      from: "PENDING",
      to: "PROCESSING",
    });

    const { internalSecret, ragIngestUrl, ragBaseUrl } = getRagConfig();

    logger.logApi("request", "/api/admin/upload", {
      documentId: createdDocument.id,
      fileName: incomingFile.name,
      fileType: incomingFile.type,
      fileSize: incomingFile.size,
      ragBaseUrl,
      ragIngestUrl,
    });

    const fileBuffer = Buffer.from(await incomingFile.arrayBuffer());
    const outboundFormData = new FormData();
    const outboundBlob = new Blob([fileBuffer], {
      type: incomingFile.type || "application/octet-stream",
    });

    outboundFormData.append("file", outboundBlob, incomingFile.name);
    outboundFormData.append("document_id", createdDocument.id);

    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => abortController.abort(), FETCH_TIMEOUT_MS);

    let ragResponse: Response;

    try {
      ragResponse = await fetch(ragIngestUrl, {
        method: "POST",
        headers: {
          "x-internal-secret": internalSecret,
        },
        body: outboundFormData,
        signal: abortController.signal,
      });
    } catch (fetchErr) {
      const message = toErrorMessage(fetchErr);
      throw new Error(`RAG fetch failed: ${message}`);
    } finally {
      clearTimeout(timeoutHandle);
    }

    if (!ragResponse.ok) {
      const ragErrorText = await ragResponse.text().catch(() => "");
      const errorMessage = `RAG service error (${ragResponse.status})${ragErrorText ? `: ${ragErrorText.slice(0, MAX_REMOTE_ERROR_PREVIEW)}` : ""}`;

      await prisma.document.update({
        where: { id: createdDocument.id },
        data: {
          ingestionStatus: "FAILED",
          errorMessage: toStoredErrorMessage(errorMessage),
        },
      });

      logger.logDb("document.ingestionStatus", {
        documentId: createdDocument.id,
        from: "PROCESSING",
        to: "FAILED",
        reason: errorMessage,
      });

      logger.logApi("error", "/api/admin/upload", {
        documentId: createdDocument.id,
        status: ragResponse.status,
        errorMessage,
      });

      return NextResponse.json({ error: "Ingestion failed", detail: errorMessage }, { status: 500 });
    }

    const completedDocument = await prisma.document.update({
      where: { id: createdDocument.id },
      data: {
        ingestionStatus: "DONE",
        ingestedAt: new Date(),
        errorMessage: null,
      },
    });

    logger.logDb("document.ingestionStatus", {
      documentId: createdDocument.id,
      from: "PROCESSING",
      to: "DONE",
    });

    logger.logApi("response", "/api/admin/upload", {
      documentId: createdDocument.id,
      status: 201,
    });

    return NextResponse.json(completedDocument, { status: 201 });
  } catch (err) {
    const failureMessage = toErrorMessage(err);

    if (createdDocumentId) {
      try {
        await prisma.document.update({
          where: { id: createdDocumentId },
          data: {
            ingestionStatus: "FAILED",
            errorMessage: toStoredErrorMessage(failureMessage),
          },
        });

        logger.logDb("document.ingestionStatus", {
          documentId: createdDocumentId,
          to: "FAILED",
          reason: failureMessage,
        });
      } catch (updateErr) {
        logger.logApi("error", "/api/admin/upload", {
          message: toErrorMessage(updateErr),
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
