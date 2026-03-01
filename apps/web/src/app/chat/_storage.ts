import type { StoredChat } from "./_types";

const STORAGE_KEY = "smartassist-chats";

export const loadChats = (): StoredChat[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is StoredChat =>
        c &&
        typeof c === "object" &&
        typeof c.id === "string" &&
        typeof c.title === "string" &&
        typeof c.createdAt === "number" &&
        Array.isArray(c.messages)
    );
  } catch {
    return [];
  }
};

export const saveChats = (chats: StoredChat[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch {
    // ignore
  }
};
