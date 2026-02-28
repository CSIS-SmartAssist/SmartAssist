"use client";

// Drag + drop upload (Saksham)

type Props = { onUpload: (file: File) => void; disabled?: boolean };

export const FileUploadZone = ({ onUpload, disabled }: Props) => (
  <div
    className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground"
    onDrop={(e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && !disabled) onUpload(file);
    }}
    onDragOver={(e) => e.preventDefault()}
  >
    Drop a file here or click to upload
  </div>
);
