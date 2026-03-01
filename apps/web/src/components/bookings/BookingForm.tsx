"use client";

import { useEffect, useState } from "react";
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
import * as logger from "@/lib/logger";

type Room = { id: string; name: string };

type BookingFormProps = {
  onSuccess?: () => void;
  initialRoomId?: string;
  initialRoomName?: string;
};

export const BookingForm = ({ onSuccess, initialRoomId, initialRoomName }: BookingFormProps = {}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

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
    const loadRooms = async () => {
      try {
        setIsLoadingRooms(true);
        const response = await fetch("/api/rooms", { method: "GET" });
        const payload = (await response.json()) as Array<{ id: string; name: string }> | { error?: string };

        if (!response.ok || !Array.isArray(payload)) {
          throw new Error((payload as { error?: string }).error ?? "Failed to load rooms");
        }

        setRooms(payload.map((room) => ({ id: room.id, name: room.name })));
      } catch (error) {
        logger.error("BookingForm.loadRooms", {
          message: error instanceof Error ? error.message : String(error),
        });
        form.setError("root", { message: "Failed to load rooms." });
      } finally {
        setIsLoadingRooms(false);
      }
    };

    void loadRooms();
  }, [form]);

  useEffect(() => {
    if (!initialRoomId) return;
    if (!rooms.some((room) => room.id === initialRoomId)) return;
    form.setValue("roomId", initialRoomId, { shouldValidate: true });
  }, [form, initialRoomId, rooms]);

  useEffect(() => {
    if (!initialRoomName) return;
    const matchedRoom = rooms.find(
      (room) => room.name.trim().toLowerCase() === initialRoomName.trim().toLowerCase(),
    );
    if (!matchedRoom) return;
    form.setValue("roomId", matchedRoom.id, { shouldValidate: true });
  }, [form, initialRoomName, rooms]);

  const onSubmit = async (data: BookingRequestValues) => {
    try {
      form.clearErrors("root");
      const response = await fetch("/api/bookings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to submit booking.");
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      logger.error("BookingForm.submit", {
        message: error instanceof Error ? error.message : String(error),
      });
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to submit booking.",
      });
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
                    <SelectValue placeholder={isLoadingRooms ? "Loading rooms..." : "Select a room"} />
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
