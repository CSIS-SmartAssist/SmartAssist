// User + assistant bubbles (Saksham)

type Props = { role: "user" | "assistant"; content: string };

export function MessageBubble({ role, content }: Props) {
  return (
    <div
      className={
        role === "user"
          ? "ml-auto max-w-[80%] rounded-lg bg-primary p-3 text-primary-foreground"
          : "mr-auto max-w-[80%] rounded-lg bg-muted p-3"
      }
    >
      {content}
    </div>
  );
}
