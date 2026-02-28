"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActionCardProps } from "../_types";

export const ActionCard = ({
  title,
  description,
  href = "#",
  buttonLabel,
  icon,
  badge,
  badgeVariant = "default",
}: ActionCardProps) => {
  return (
    <Card className="neon-card flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="relative pb-2">
        {badge && (
          <CardAction>
            <Badge variant={badgeVariant}>{badge}</Badge>
          </CardAction>
        )}
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto pt-4">
        <Button
          asChild
          variant="default"
          size="sm"
          className="w-full sm:w-auto"
        >
          <Link href={href} className="inline-flex items-center gap-1">
            {buttonLabel}
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
