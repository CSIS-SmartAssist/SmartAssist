"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BookingForm } from "@/components/bookings/BookingForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CustomRequestDialogButtonProps = {
  compact?: boolean;
  className?: string;
};

export const CustomRequestDialogButton = ({
  compact = false,
  className,
}: CustomRequestDialogButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button
            size="icon-lg"
            className={cn("size-14 rounded-full shadow-lg", className)}
            aria-label="Custom request"
          >
            <Plus className="size-6" />
          </Button>
        ) : (
          <Button className={cn("h-9 flex-1 sm:flex-none", className)}>
            <Plus className="size-4" />
            Custom Request
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Custom Booking Request</DialogTitle>
          <DialogDescription>
            Submit room, start time, end time, and reason.
          </DialogDescription>
        </DialogHeader>
        <BookingForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
