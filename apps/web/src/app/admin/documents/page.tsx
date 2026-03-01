"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FolderPlus, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DriveSyncButton } from "@/components/admin/DriveSyncButton";
import { FileUploadZone } from "@/components/admin/FileUploadZone";
import { DocumentsTable, type AdminDocument } from "@/components/admin/DocumentsTable";
import * as logger from "@/lib/logger";

type ApiDocument = {
  id: string;
  filename: string;
  source: "DIRECT_UPLOAD" | "GOOGLE_DRIVE";
  ingestionStatus: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  createdAt: string;
  ingestedAt: string | null;
  errorMessage: string | null;
};

const mapDocument = (doc: ApiDocument): AdminDocument => ({
  id: doc.id,
  filename: doc.filename,
  source: doc.source,
  status: doc.ingestionStatus,
  createdAt: doc.createdAt,
  ingestedAt: doc.ingestedAt,
  errorMessage: doc.errorMessage,
});

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const topUploadInputRef = useRef<HTMLInputElement | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await fetch("/api/admin/documents", { method: "GET" });
      const payload = (await response.json()) as ApiDocument[] | { error?: string };

      if (!response.ok || !Array.isArray(payload)) {
        throw new Error((payload as { error?: string }).error ?? "Failed to fetch documents");
      }

      setDocuments(payload.map(mapDocument));
    } catch (error) {
      logger.error("AdminDocumentsPage.loadDocuments", {
        message: error instanceof Error ? error.message : String(error),
      });
      setErrorMessage(error instanceof Error ? error.message : "Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setErrorMessage(null);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const payload = (await response.json()) as { error?: string; detail?: string };
      if (!response.ok) {
        throw new Error(payload.detail ?? payload.error ?? "Upload failed");
      }

      await loadDocuments();
    } catch (error) {
      logger.error("AdminDocumentsPage.uploadFile", {
        fileName: file.name,
        message: error instanceof Error ? error.message : String(error),
      });
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const syncDrive = async () => {
    try {
      setIsSyncing(true);
      setErrorMessage(null);
      const response = await fetch("/api/admin/drive-sync", { method: "POST" });
      const payload = (await response.json()) as { error?: string; detail?: string };

      if (!response.ok) {
        throw new Error(payload.detail ?? payload.error ?? "Drive sync failed");
      }

      await loadDocuments();
    } catch (error) {
      logger.error("AdminDocumentsPage.syncDrive", {
        message: error instanceof Error ? error.message : String(error),
      });
      setErrorMessage(error instanceof Error ? error.message : "Drive sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const createFolder = async () => {
    const folderName = window.prompt("Enter folder name");
    if (!folderName) return;

    const normalizedName = folderName.trim();
    if (!normalizedName) {
      setErrorMessage("Folder name cannot be empty");
      return;
    }

    try {
      setIsCreatingFolder(true);
      setErrorMessage(null);

      const response = await fetch("/api/admin/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalizedName }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create folder");
      }

      await loadDocuments();
    } catch (error) {
      logger.error("AdminDocumentsPage.createFolder", {
        folderName: normalizedName,
        message: error instanceof Error ? error.message : String(error),
      });
      setErrorMessage(error instanceof Error ? error.message : "Failed to create folder");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px]">
        <aside className="w-72 border-r border-border bg-card p-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="size-7 rounded-lg bg-primary/20" />
            <p className="text-2xl font-bold text-primary">Smart Assist</p>
          </div>

          <Card className="mb-6 rounded-xl border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">Admin</p>
            <p className="text-xs text-foreground-secondary">Knowledge Manager</p>
          </Card>

          <div className="space-y-2">
            <Button className="w-full justify-start rounded-xl bg-primary/20 text-primary hover:bg-primary/25">
              My Documents
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start text-foreground-secondary hover:text-foreground">
              <Link href="/admin">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start text-foreground-secondary hover:text-foreground">
              <Link href="/admin/bookings">Bookings</Link>
            </Button>
          </div>
        </aside>

        <main className="flex-1">
          <header className="flex items-center justify-between border-b border-border bg-background px-8 py-4">
            <div className="flex items-center gap-6 text-sm text-foreground-secondary">
              <span className="text-foreground-muted">Documents</span>
              <span className="font-semibold text-foreground">Assignments</span>
              <Link href="/admin" className="text-foreground-muted hover:text-foreground">Dashboard</Link>
              <Link href="/admin/bookings" className="text-foreground-muted hover:text-foreground">Rooms</Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => void createFolder()}
                disabled={isCreatingFolder || isUploading || isSyncing}
              >
                <FolderPlus className="size-4" />
                {isCreatingFolder ? "Creating..." : "Create Folder"}
              </Button>
              <Button
                type="button"
                className="rounded-xl"
                onClick={() => topUploadInputRef.current?.click()}
                disabled={isUploading || isSyncing || isCreatingFolder}
              >
                <Upload className="size-4" />
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
              <DriveSyncButton onSync={() => void syncDrive()} loading={isSyncing} />
              <input
                ref={topUploadInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file || isUploading || isSyncing || isCreatingFolder) return;
                  void uploadFile(file);
                  event.target.value = "";
                }}
                disabled={isUploading || isSyncing || isCreatingFolder}
              />
            </div>
          </header>

          <div className="space-y-6 p-8">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-bold tracking-tight">My Documents</h1>
              <span className="rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                {documents.length} documents
              </span>
            </div>

            <Card className="rounded-2xl border border-border bg-card p-6">
              <FileUploadZone onUpload={(file) => void uploadFile(file)} disabled={isUploading || isSyncing} />
              {errorMessage ? <p className="mt-3 text-sm text-destructive">{errorMessage}</p> : null}
            </Card>

            <Card className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Documents</h2>
                <Button variant="outline" onClick={() => void loadDocuments()} disabled={isLoading}>
                  Refresh
                </Button>
              </div>
              <DocumentsTable documents={documents} isLoading={isLoading} />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
