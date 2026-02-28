// Chat UI — ask questions, see cited answers (Saksham)
// Calls POST /api/chat which proxies to FastAPI /rag/query

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col p-4">
      <h1 className="mb-4 text-xl font-semibold">Chat</h1>
      {/* TODO: Message list, MessageBubble, CitationCard, ChatInput */}
      <p className="text-muted-foreground text-sm">Chat UI — wire to /api/chat</p>
    </div>
  );
}
