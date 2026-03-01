export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  author?: string;
};

/** List item from GET /api/chats (no messages). */
export type ChatListItem = {
  id: string;
  title: string;
  pinned?: boolean;
  createdAt: number;
  updatedAt?: number;
};

/** Legacy shape for localStorage; kept for migration or fallback. */
export type StoredChat = {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
};
