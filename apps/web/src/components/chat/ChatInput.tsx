"use client";

// Message input bar (Saksham)

type Props = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled }: Props) {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.querySelector("input");
        const msg = input?.value?.trim();
        if (msg) {
          onSend(msg);
          input.value = "";
        }
      }}
    >
      <input
        type="text"
        placeholder="Ask about policies, TA forms, lab rules..."
        className="flex-1 rounded-md border px-3 py-2"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
        Send
      </button>
    </form>
  );
}
