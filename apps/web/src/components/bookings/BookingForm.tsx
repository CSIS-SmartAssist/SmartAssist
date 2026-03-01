"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bookingRequestSchema, type BookingRequestValues } from "@/lib/validations/booking";

type Room = { id: string; name: string };

export const BookingForm = () => {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<Room[]>([]);

  const form = useForm<BookingRequestValues>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      roomId: "",
      startTime: "",
      endTime: "",
      reason: "",
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/rooms");
        if (!res.ok) return;
        const data = (await res.json()) as Room[];
        setRooms(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  const onSubmit = async (data: BookingRequestValues) => {
    const userId = session?.user?.id;
    if (!userId) {
      form.setError("root", { message: "You must be signed in to book." });
      return;
    }
    try {
      const res = await fetch("/api/bookings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          roomId: data.roomId,
          startTime: data.startTime,
          endTime: data.endTime,
          reason: data.reason.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        form.setError("root", {
          message: (json.error as string) ?? "Failed to submit booking.",
        });
        return;
      }
      form.reset();
    } catch {
      form.setError("root", { message: "Failed to submit booking." });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 max-w-md"
      >
        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={rooms.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea placeholder="Brief reason for the booking" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting…" : "Request booking"}
        </Button>
      </form>
    </Form>
  );
};
