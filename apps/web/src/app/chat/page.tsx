"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bot,
  Calendar,
  CalendarDays,
  Folder,
  History,
  ImagePlus,
  LayoutGrid,
  Menu,
  MessageSquare,
  Mic,
  MoreVertical,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { DashboardUser } from "@/app/dashboard/_types";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  author?: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    author: "SMART ASSIST AI",
    content:
      "Hello! I’m ready to help with your DSA queries today. We’re currently looking at tree structures. What can I clarify for you?",
  },
  {
    id: "m2",
    role: "user",
    author: "VEDANT KAMATH",
    content:
      "Can you explain the difference between a Red-Black tree and an AVL tree?",
  },
  {
    id: "m3",
    role: "assistant",
    author: "SMART ASSIST AI",
    content:
      "Great question! Both Red-Black trees and AVL trees are self-balancing binary search trees, but they handle balancing differently.",
  },
];

const PLACEHOLDER_404_PATH = "/__coming-soon__";

const ChatPage = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [desktopInput, setDesktopInput] = useState("");
  const [mobileInput, setMobileInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

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
  const dashboardUser: DashboardUser = {
    name: userName,
    email: userEmail,
    image: session?.user?.image ?? null,
  };

  useEffect(() => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollTop = desktopScrollRef.current.scrollHeight;
    }
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollTop = mobileScrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const sendMessage = async (rawValue: string, source: "desktop" | "mobile") => {
    const text = rawValue.trim();
    if (!text || isSending) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        role: "user",
        author: userAuthor,
        content: text,
      },
    ]);

    if (source === "desktop") {
      setDesktopInput("");
    } else {
      setMobileInput("");
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const payload = (await response.json()) as { answer?: string; error?: string };

      const answer = payload.answer;
      if (!response.ok || typeof answer !== "string") {
        throw new Error(payload.error ?? "Failed to get response");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          author: "SMART ASSIST AI",
          content: answer,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          author: "SMART ASSIST AI",
          content: "I couldn’t fetch a response right now. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const onDesktopSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(desktopInput, "desktop");
  };

  const onMobileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(mobileInput, "mobile");
  };

  return (
    <div className="relative h-screen overflow-hidden bg-background text-foreground">
      <div
        className="glow-orb glow-orb-primary -top-32 right-[-10%] lg:right-[5%]"
        aria-hidden
      />
      <div
        className="glow-orb glow-orb-secondary -bottom-24 -left-[8%] lg:left-[2%]"
        aria-hidden
      />

      <div className="relative z-10 flex h-full min-h-0">
        <DashboardSidebar
          user={dashboardUser}
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
      <div className="hidden h-full lg:flex lg:flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-8 shadow-[0_1px_0_hsl(var(--primary)/0.22),0_0_22px_hsl(var(--primary)/0.08)] backdrop-blur">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.45)]">
                <Bot className="size-4" />
              </div>
              <p className="text-lg font-semibold">Smart Assist AI</p>
            </div>
            <nav className="flex items-center gap-6 text-sm text-foreground-secondary">
              <Link href="/dashboard" className="text-foreground hover:text-foreground">Dashboard</Link>
              <Link href={PLACEHOLDER_404_PATH} className="hover:text-foreground">Library</Link>
              <Link href={PLACEHOLDER_404_PATH} className="hover:text-foreground">Schedule</Link>
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
              <Button size="icon" variant="ghost" className="rounded-full" asChild aria-label="Notifications">
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
            <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-3xl border-border/80 bg-card/80 p-0">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-accent-green" />
                    <p className="text-base font-semibold leading-none">Smart Assist AI</p>
                  </div>
                  <p className="mt-0.5 text-xs text-foreground-secondary">
                    Subject Context: <span className="font-medium text-primary">CS211 Data Structures &amp; Algorithms</span>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" asChild aria-label="History">
                    <Link href={PLACEHOLDER_404_PATH}>
                      <History className="size-4" />
                    </Link>
                  </Button>
                  <Button size="icon" variant="ghost" asChild aria-label="More options">
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
                      <div key={message.id} className="flex max-w-5xl items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Bot className="size-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="pl-1 text-[11px] font-semibold text-foreground-muted">{message.author}</p>
                          <Card className="rounded-3xl rounded-tl-md border-border/70 p-0">
                            <p className="px-4 py-[17px] text-base leading-7">{message.content}</p>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <div key={message.id} className="ml-auto flex max-w-4xl items-start gap-3">
                        <div className="flex-1 space-y-1">
                          <p className="pr-1 text-right text-[11px] font-semibold text-foreground-muted">{userAuthor}</p>
                          <div className="rounded-3xl rounded-tr-md bg-primary px-4 py-3 text-sm text-primary-foreground shadow-md shadow-primary/20">
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
                      <Card className="rounded-3xl rounded-tl-md border-border/70 p-0">
                        <p className="px-4 py-4 text-sm text-foreground-secondary">Thinking...</p>
                      </Card>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-border bg-background/80 px-6 pb-3 pt-3">
                <form onSubmit={onDesktopSubmit} className="flex items-center gap-2">
                  <Card className="flex h-10 flex-1 flex-row items-center rounded-2xl border-border/80 bg-card px-1 py-0">
                    <Button size="icon" variant="ghost" className="size-8 shrink-0" aria-label="Attach">
                      <Plus className="size-4" />
                    </Button>
                    <Input
                      value={desktopInput}
                      onChange={(event) => setDesktopInput(event.target.value)}
                      placeholder="Ask about DSA algorithms, complexity, or implementations..."
                      className="h-8 flex-1 border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
                    />
                    <Button size="icon" variant="ghost" className="size-8 shrink-0" aria-label="Voice">
                      <Mic className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8 shrink-0" aria-label="Image">
                      <ImagePlus className="size-4" />
                    </Button>
                  </Card>
                  <Button size="icon" type="submit" disabled={isSending} className="size-10 shrink-0 rounded-2xl" aria-label="Send">
                    <Send className="size-4" />
                  </Button>
                </form>
                <p className="mt-1 text-center text-[9px] uppercase tracking-[0.1em] text-foreground-muted">
                  Powered by Smart Assist AI Engine • Academic Context Applied
                </p>
              </div>
            </Card>
          </section>
        </div>
      </div>

      <div className="flex h-full flex-col lg:hidden">
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Bot className="size-4" />
            </div>
            <div>
              <p className="text-base font-semibold">Smart Assist AI</p>
              <p className="text-xs text-foreground-secondary">Online • {userId}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" asChild aria-label="History">
              <Link href={PLACEHOLDER_404_PATH}>
                <History className="size-4" />
              </Link>
            </Button>
            <Button size="icon" variant="ghost" asChild aria-label="Notifications">
              <Link href={PLACEHOLDER_404_PATH}>
                <Bell className="size-4" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="border-b border-border px-4 py-3">
          <Button variant="outline" className="w-full justify-between rounded-full text-left text-sm" asChild>
            <Link href={PLACEHOLDER_404_PATH}>
              <span className="truncate">Active: Balanced Binary Search Trees</span>
              <Calendar className="size-4" />
            </Link>
          </Button>
        </div>

        <div
          ref={mobileScrollRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-background-secondary/30 px-4 py-4 pb-28"
        >
          <p className="text-center text-xs font-semibold tracking-wide text-foreground-muted">TODAY, 10:23 AM</p>

          {messages.map((message) =>
            message.role === "assistant" ? (
              <div key={message.id} className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <Bot className="size-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold">Smart Assist</p>
                  <Card className="rounded-3xl rounded-tl-md p-0">
                    <p className="px-4 py-4 text-base leading-8">{message.content}</p>
                  </Card>
                  {message.id === "m1" && (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="rounded-full px-4 py-1 text-primary">AVL Rotations</Badge>
                      <Badge variant="secondary" className="rounded-full px-4 py-1 text-primary">Red-Black Properties</Badge>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={message.id} className="ml-auto max-w-[85%]">
                <Card className="rounded-3xl rounded-tr-md bg-primary p-0 text-base leading-8 text-primary-foreground shadow-md shadow-primary/25">
                  <p className="px-4 py-4">{message.content}</p>
                </Card>
                <p className="mt-1 text-right text-xs text-foreground-muted">Read 10:25 AM</p>
              </div>
            ),
          )}

          {isSending && (
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                <Bot className="size-4" />
              </div>
              <Card className="rounded-3xl rounded-tl-md p-0">
                <p className="px-4 py-3 text-sm text-foreground-secondary">Thinking...</p>
              </Card>
            </div>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-16 border-t border-border bg-background px-3 pb-2.5 pt-2">
          <form onSubmit={onMobileSubmit} className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="size-8 rounded-full" aria-label="Add">
              <Plus className="size-4" />
            </Button>
            <Card className="flex h-11 flex-1 flex-row items-center rounded-2xl p-0">
              <Input
                value={mobileInput}
                onChange={(event) => setMobileInput(event.target.value)}
                placeholder="Ask a question about Red-Black Trees..."
                className="h-8 border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0"
              />
              <Button size="icon" variant="ghost" className="size-8" aria-label="Voice">
                <Mic className="size-4" />
              </Button>
            </Card>
            <Button size="icon" type="submit" disabled={isSending} className="size-11 rounded-2xl" aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </div>

        <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-background">
          <div className="grid h-16 grid-cols-4">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center justify-center text-xs ${pathname === "/dashboard" ? "font-semibold text-primary" : "text-foreground-secondary"}`}
            >
              <LayoutGrid className="mb-1 size-4" />
              Dashboard
            </Link>
            <Link
              href="/chat"
              className={`flex flex-col items-center justify-center text-xs ${pathname === "/chat" ? "font-semibold text-primary" : "text-foreground-secondary"}`}
            >
              <MessageSquare className="mb-1 size-4" />
              Chat
            </Link>
            <Link
              href="/bookings"
              className={`flex flex-col items-center justify-center text-xs ${pathname === "/bookings" ? "font-semibold text-primary" : "text-foreground-secondary"}`}
            >
              <Folder className="mb-1 size-4" />
              Bookings
            </Link>
            <Link
              href="/dashboard/history"
              className={`flex flex-col items-center justify-center text-xs ${pathname === "/dashboard/history" ? "font-semibold text-primary" : "text-foreground-secondary"}`}
            >
              <CalendarDays className="mb-1 size-4" />
              History
            </Link>
          </div>
        </nav>
      </div>
      </div>
      </div>
    </div>
  );
};

export default ChatPage;
