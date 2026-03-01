import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AdminDocument = {
  id: string;
  filename: string;
  source: "DIRECT_UPLOAD" | "GOOGLE_DRIVE";
  status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  createdAt: string;
  ingestedAt: string | null;
  errorMessage: string | null;
};

type Props = {
  documents: AdminDocument[];
  isLoading?: boolean;
};

const statusVariant = (status: AdminDocument["status"]): "default" | "secondary" | "destructive" => {
  if (status === "DONE") return "default";
  if (status === "FAILED") return "destructive";
  return "secondary";
};

const statusLabel = (status: AdminDocument["status"]) => status.toLowerCase();

export const DocumentsTable = ({ documents, isLoading = false }: Props) => {
  if (isLoading) {
    return <p className="text-sm text-foreground-secondary">Loading documents...</p>;
  }

  if (documents.length === 0) {
    return <p className="text-sm text-foreground-secondary">No documents found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Filename</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Ingested</TableHead>
          <TableHead>Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow key={document.id}>
            <TableCell className="max-w-xs truncate font-medium text-foreground">
              {document.filename}
            </TableCell>
            <TableCell>{document.source === "GOOGLE_DRIVE" ? "Google Drive" : "Direct Upload"}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(document.status)}>{statusLabel(document.status)}</Badge>
            </TableCell>
            <TableCell className="text-sm text-foreground-secondary">
              {new Date(document.createdAt).toLocaleString()}
            </TableCell>
            <TableCell className="text-sm text-foreground-secondary">
              {document.ingestedAt ? new Date(document.ingestedAt).toLocaleString() : "-"}
            </TableCell>
            <TableCell className="max-w-xs whitespace-normal text-xs text-destructive">
              {document.errorMessage ?? "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
