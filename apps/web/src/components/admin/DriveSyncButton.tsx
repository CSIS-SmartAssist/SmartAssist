"use client";

// Manual sync button (Saksham) — calls POST /api/admin/drive-sync

type Props = { onSync: () => void; loading?: boolean };

export const DriveSyncButton = ({ onSync, loading }: Props) => (
  <button
    type="button"
    onClick={onSync}
    disabled={loading}
    className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
  >
    {loading ? "Syncing…" : "Sync Google Drive"}
  </button>
);
