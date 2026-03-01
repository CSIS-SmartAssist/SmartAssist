"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = { onUpload: (file: File) => void; disabled?: boolean };

export const FileUploadZone = ({ onUpload, disabled = false }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Card
      className="rounded-2xl border-dashed border-border/80 p-6 text-center"
      onDrop={(event) => {
        event.preventDefault();
        if (disabled) return;
        const file = event.dataTransfer.files?.[0];
        if (file) onUpload(file);
      }}
      onDragOver={(event) => event.preventDefault()}
    >
      <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-background-secondary">
        <Upload className="size-5 text-foreground-secondary" />
      </div>
      <p className="text-sm font-medium text-foreground">Drag and drop a file</p>
      <p className="mt-1 text-xs text-foreground-secondary">PDF, DOCX, or TXT only</p>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file || disabled) return;
          onUpload(file);
          event.target.value = "";
        }}
        disabled={disabled}
      />

      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        Choose File
      </Button>
    </Card>
  );
};
