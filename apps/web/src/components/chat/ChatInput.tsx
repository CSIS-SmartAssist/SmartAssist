"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { chatMessageSchema, type ChatMessageValues } from "@/lib/validations/chat";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const form = useForm<ChatMessageValues>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { message: "" },
  });

  const onSubmit = (data: ChatMessageValues) => {
    onSend(data.message);
    form.reset({ message: "" });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-2"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Ask about policies, TA forms, lab rules..."
                  disabled={disabled}
                  className="flex-1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={disabled ?? form.formState.isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Send
        </Button>
      </form>
    </Form>
  );
};
