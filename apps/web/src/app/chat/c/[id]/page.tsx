"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import {
  Bell,
  Bot,
  History,
  ImagePlus,
  Menu,
  Mic,
  MoreVertical,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import * as logger from "@/lib/logger";
import type { ChatMessage } from "../../_types";
import { useChatSidebar } from "../../layout";
import {
  chatMessageSchema,
  type ChatMessageValues,
} from "@/lib/validations/chat";

const getOnboardingMessage = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! How can I assist you today?";
  if (hour < 17) return "Good afternoon! How can I assist you today?";
  return "Good evening! How can I assist you today?";
};

const getInitialMessages = (): ChatMessage[] => [
  {
    id: "welcome",
    role: "assistant",
    author: "SMART ASSIST AI",
    content: getOnboardingMessage(),
  },
];

const PLACEHOLDER_404_PATH = "/__coming-soon__";

const ConversationChatPage = () => {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { data: session } = useSession();
  const { setSidebarOpen, addOrUpdateChat } = useChatSidebar();
  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const desktopScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);

  const chatForm = useForm<ChatMessageValues>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { message: "" },
  });

  const userName = session?.user?.name?.trim() || "Student";
  const userEmail = session?.user?.email?.trim() || "student@university.edu";
  const userId = userEmail.split("@")[0] || "student";
  const userInitials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const userAuthor = userName.toUpperCase();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/chats/${id}`);
        if (!res.ok) {
          setMessages(getInitialMessages());
          return;
        }
        const data = (await res.json()) as {
          id: string;
          title: string;
          createdAt: number;
          updatedAt: number;
          messages: ChatMessage[];
        };
        setMessages(
          data.messages?.length ? data.messages : getInitialMessages(),
        );
        if (data.title === "New Chat" && data.messages?.length) {
          const firstUser = data.messages.find((m) => m.role === "user");
          const newTitle = firstUser
            ? firstUser.content.trim().slice(0, 40) || "New chat"
            : "New chat";
          fetch(`/api/chats/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          })
            .then((r) => r.json())
            .then((patched: { title?: string; updatedAt?: number }) => {
              if (patched.title)
                addOrUpdateChat({
                  id,
                  title: patched.title,
                  createdAt: data.createdAt,
                  updatedAt: patched.updatedAt ?? data.updatedAt,
                });
            })
            .catch((err) => {
              logger.warn("chat", "Failed to update conversation title", id, err instanceof Error ? err.message : String(err));
            });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, addOrUpdateChat]);

  useEffect(() => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollTop =
        desktopScrollRef.current.scrollHeight;
    }
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollTop = mobileScrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const sendMessage = async (rawValue: string) => {
    const text = rawValue.trim();
    if (!text || isSending || !id) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      author: userAuthor,
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId: id }),
      });
      const payload = (await response.json()) as {
        answer?: string;
        error?: string;
      };
      const answer = payload.answer;
      if (!response.ok || typeof answer !== "string") {
        throw new Error(payload.error ?? "Failed to get response");
      }
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        author: "SMART ASSIST AI",
        content: answer,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      logger.logApi("error", "/api/chat (client)", { conversationId: id, message: err instanceof Error ? err.message : String(err) });
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          author: "SMART ASSIST AI",
          content: "I couldn't fetch a response right now. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const onChatSubmit = () =>
    chatForm.handleSubmit((data) => {
      const message = data.message.trim();
      if (!message) return;
      chatForm.reset({ message: "" });
      sendMessage(message);
    });

  if (!id) {
    return (
      <div className="flex h-full items-center justify-center text-foreground-muted">
        Invalid conversation
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-foreground-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden bg-background text-foreground">
      <div
        className="glow-orb glow-orb-primary -top-32 right-[-10%] lg:right-[5%]"
        aria-hidden
      />
      <div
        className="glow-orb glow-orb-secondary -bottom-24 -left-[8%] lg:left-[2%]"
        aria-hidden
      />
      <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col">
        <div className="hidden h-full lg:flex lg:flex-col">
          <header className="neon-card flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-8 backdrop-blur">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.45)]">
                  <Bot className="size-4" />
                </div>
                <p className="text-glow text-lg font-semibold">
                  Smart Assist AI
                </p>
              </div>
              <nav className="flex items-center gap-6 text-sm text-foreground-secondary">
                <Link
                  href="/dashboard"
                  className="text-foreground hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Link
                  href={PLACEHOLDER_404_PATH}
                  className="hover:text-foreground"
                >
                  Library
                </Link>
                <Link
                  href={PLACEHOLDER_404_PATH}
                  className="hover:text-foreground"
                >
                  Schedule
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                <Input
                  placeholder="Search resources..."
                  className="h-10 rounded-xl border-border/80 bg-background-secondary/60 pl-9 shadow-[0_0_16px_hsl(var(--primary)/0.08)]"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  asChild
                  aria-label="Notifications"
                >
                  <Link href={PLACEHOLDER_404_PATH} className="relative">
                    <Bell className="size-4" />
                    <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent-red text-[10px] font-bold text-white">
                      2
                    </span>
                  </Link>
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </header>
          <div className="flex min-h-0 flex-1">
            <section className="min-h-0 flex-1 p-0">
              <Card className="neon-card flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-none border-border/80 bg-card/80 p-0">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-accent-green" />
                      <p className="text-glow text-base font-semibold leading-none">
                        Smart Assist AI
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-foreground-secondary">
                      Subject Context:{" "}
                      <span className="text-glow font-medium text-primary">
                        CS211 Data Structures &amp; Algorithms
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      asChild
                      aria-label="History"
                    >
                      <Link href={PLACEHOLDER_404_PATH}>
                        <History className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      asChild
                      aria-label="More options"
                    >
                      <Link href={PLACEHOLDER_404_PATH}>
                        <MoreVertical className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div
                  ref={desktopScrollRef}
                  className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-background-secondary/40 px-0 py-0"
                >
                  <div className="space-y-5 px-6 py-6">
                    {messages.map((message) =>
                      message.role === "assistant" ? (
                        <div
                          key={message.id}
                          className="flex max-w-5xl items-start gap-3"
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Bot className="size-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="pl-1 text-[11px] font-semibold text-foreground-muted">
                              {message.author}
                            </p>
                            <Card className="neon-card rounded-3xl rounded-tl-md border-border/70 p-0">
                              <p className="px-4 py-4.25 text-base leading-7">
                                {message.content}
                              </p>
                            </Card>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={message.id}
                          className="ml-auto flex max-w-4xl items-start gap-3"
                        >
                          <div className="flex-1 space-y-1">
                            <p className="pr-1 text-right text-[11px] font-semibold text-foreground-muted">
                              {userAuthor}
                            </p>
                            <div className="neon-card rounded-3xl rounded-tr-md bg-primary px-4 py-3 text-sm text-primary-foreground shadow-md shadow-primary/20">
                              {message.content}
                            </div>
                          </div>
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {userInitials}
                          </div>
                        </div>
                      ),
                    )}
                    {isSending && (
                      <div className="flex max-w-5xl items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Bot className="size-4" />
                        </div>
                        <Card className="neon-card rounded-3xl rounded-tl-md border-border/70 p-0">
                          <p className="px-4 py-4 text-sm text-foreground-secondary">
                            Thinking...
                          </p>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-border bg-background/80 px-6 pb-3 pt-3">
                  <form
                    onSubmit={(e) => onChatSubmit()(e)}
                    className="flex items-center gap-2"
                  >
                    <Card className="neon-card flex h-10 flex-1 flex-row items-center rounded-2xl border-border/80 bg-card px-1 py-0">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0"
                        aria-label="Attach"
                      >
                        <Plus className="size-4" />
                      </Button>
                      <Input
                        {...chatForm.register("message")}
                        placeholder="Ask about DSA algorithms, complexity, or implementations..."
                        className="h-8 flex-1 border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0"
                        aria-label="Voice"
                      >
                        <Mic className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0"
                        aria-label="Image"
                      >
                        <ImagePlus className="size-4" />
                      </Button>
                    </Card>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isSending}
                      className="size-10 shrink-0 rounded-2xl"
                      aria-label="Send"
                    >
                      <Send className="size-4" />
                    </Button>
                  </form>
                  <p className="text-glow mt-1 text-center text-[9px] uppercase tracking-widest text-foreground-muted">
                    Powered by Smart Assist AI Engine • Academic Context Applied
                  </p>
                </div>
              </Card>
            </section>
          </div>
        </div>
        <div className="flex h-full flex-col lg:hidden">
          <header className="neon-card flex items-center justify-between border-b border-border bg-background px-4 py-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menu"
            >
              <Menu className="size-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Bot className="size-4" />
              </div>
              <div>
                <p className="text-glow text-base font-semibold">
                  Smart Assist AI
                </p>
                <p className="text-xs text-foreground-secondary">
                  Online • {userId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" asChild aria-label="History">
                <Link href={PLACEHOLDER_404_PATH}>
                  <History className="size-4" />
                </Link>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                asChild
                aria-label="Notifications"
              >
                <Link href={PLACEHOLDER_404_PATH}>
                  <Bell className="size-4" />
                </Link>
              </Button>
            </div>
          </header>
          <div
            ref={mobileScrollRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-background-secondary/30 px-4 py-4 pb-24"
          >
            {messages.map((message) =>
              message.role === "assistant" ? (
                <div key={message.id} className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <Bot className="size-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-glow text-sm font-semibold">
                      Smart Assist
                    </p>
                    <Card className="neon-card rounded-3xl rounded-tl-md p-0">
                      <p className="px-4 py-4 text-base leading-8">
                        {message.content}
                      </p>
                    </Card>
                  </div>
                </div>
              ) : (
                <div key={message.id} className="ml-auto max-w-[85%]">
                  <Card className="neon-card rounded-3xl rounded-tr-md bg-primary p-0 text-base leading-8 text-primary-foreground shadow-md shadow-primary/25">
                    <p className="px-4 py-4">{message.content}</p>
                  </Card>
                </div>
              ),
            )}
            {isSending && (
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <Bot className="size-4" />
                </div>
                <Card className="neon-card rounded-3xl rounded-tl-md p-0">
                  <p className="px-4 py-3 text-sm text-foreground-secondary">
                    Thinking...
                  </p>
                </Card>
              </div>
            )}
          </div>
          <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background px-3 pb-2.5 pt-2">
            <form
              onSubmit={(e) => onChatSubmit()(e)}
              className="flex items-center gap-2"
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full"
                aria-label="Add"
              >
                <Plus className="size-4" />
              </Button>
              <Card className="neon-card flex h-11 flex-1 flex-row items-center rounded-2xl p-0">
                <Input
                  value={chatForm.watch("message")}
                  onChange={(e) => chatForm.setValue("message", e.target.value)}
                  placeholder="Ask a question..."
                  className="h-8 border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  aria-label="Voice"
                >
                  <Mic className="size-4" />
                </Button>
              </Card>
              <Button
                type="submit"
                size="icon"
                disabled={isSending}
                className="size-11 rounded-2xl"
                aria-label="Send"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationChatPage;
