"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { onSync: () => void; loading?: boolean };

export const DriveSyncButton = ({ onSync, loading = false }: Props) => (
  <Button type="button" onClick={onSync} disabled={loading}>
    <RefreshCcw className={loading ? "size-4 animate-spin" : "size-4"} />
    {loading ? "Syncing..." : "Sync Google Drive"}
  </Button>
);
