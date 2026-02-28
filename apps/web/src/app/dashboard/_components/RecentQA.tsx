import Link from "next/link";
import { FileText } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import type { RecentQAItem } from "../_types";

interface RecentQAProps {
  items: RecentQAItem[];
}

export const RecentQA = ({ items }: RecentQAProps) => {
  return (
    <Card className="neon-card">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="size-5 text-foreground-secondary" aria-hidden />
          Recent Q&A
        </CardTitle>
        <CardAction>
          <Link
            href="/dashboard/history"
            className="text-sm font-medium text-primary hover:underline"
          >
            View History
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {items.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            No recent questions yet.
          </p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="space-y-1">
              <p className="flex items-start gap-2 text-sm font-medium text-foreground">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                {item.question}
              </p>
              <p className="pl-3.5 text-sm text-foreground-secondary">
                {item.answer}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
