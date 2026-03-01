/**
 * Seed dummy conversations for a specific user.
 * Run: npm run seed:chats from packages/db (or npx tsx seed-chats.ts)
 * Requires DATABASE_URL and Prisma migrations applied.
 */
import path from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

const TARGET_EMAIL = "f20220079@goa.bits-pilani.ac.in";

config({ path: path.resolve(process.cwd(), "../../.env") });
config({ path: path.resolve(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ASSISTANT_AUTHOR = "SMART ASSIST AI";

const dummyConversations: { title: string; messages: { role: "USER" | "ASSISTANT"; content: string }[] }[] = [
  {
    title: "AVL Tree rotations",
    messages: [
      { role: "USER", content: "How do I perform a left rotation on an AVL tree?" },
      {
        role: "ASSISTANT",
        content:
          "In a left rotation, you make the right child of the current root become the new root. The old root becomes the left child of the new root. You then reassign the left subtree of the new root (if any) to become the right subtree of the old root to preserve the BST property.",
      },
      { role: "USER", content: "What about the balance factor after rotation?" },
      {
        role: "ASSISTANT",
        content:
          "After a left or right rotation, you need to recompute the balance factors for the nodes that moved. In AVL, the balance factor is height(left) - height(right). Typically both the new root and the old root need their balance factors updated.",
      },
    ],
  },
  {
    title: "Red-Black tree properties",
    messages: [
      { role: "USER", content: "What are the invariants of a red-black tree?" },
      {
        role: "ASSISTANT",
        content:
          "The main invariants are: (1) Every node is either red or black. (2) The root is black. (3) All leaves (NIL) are black. (4) A red node has only black children. (5) Every path from a node to its descendant leaves has the same number of black nodes (black-height).",
      },
      { role: "USER", content: "Why is the root always black?" },
      {
        role: "ASSISTANT",
        content:
          "If the root were red, we could sometimes recolor it to black without violating other invariants. The rule that the root is black simplifies the insert/fixup logic so we can always assume the root stays black after repairs.",
      },
    ],
  },
  {
    title: "Dijkstra complexity",
    messages: [
      { role: "USER", content: "What is the time complexity of Dijkstra with a binary heap?" },
      {
        role: "ASSISTANT",
        content:
          "With a binary min-heap, Dijkstra runs in O((V + E) log V): each of the V extract-mins takes O(log V), and each of the E edges may trigger a decrease-key, each O(log V). With a Fibonacci heap it can be O(E + V log V).",
      },
      { role: "USER", content: "When would you use Dijkstra over Bellman-Ford?" },
      {
        role: "ASSISTANT",
        content:
          "Use Dijkstra when all edge weights are non-negative; it’s faster. Use Bellman-Ford when there can be negative-weight edges, or when you need to detect negative-weight cycles.",
      },
    ],
  },
];

async function main() {
  let user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: TARGET_EMAIL,
        name: "Mit Sheth",
        passwordHash: "oauth",
        role: "USER",
      },
    });
    console.log("Created user:", user.email);
  } else {
    console.log("Using existing user:", user.email);
  }

  const existing = await prisma.conversation.count({ where: { userId: user.id } });
  if (existing > 0) {
    await prisma.conversationMessage.deleteMany({
      where: { conversation: { userId: user.id } },
    });
    await prisma.conversation.deleteMany({ where: { userId: user.id } });
    console.log("Cleared", existing, "existing conversation(s).");
  }

  for (const conv of dummyConversations) {
    const created = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: conv.title,
        messages: {
          create: conv.messages.map((m) => ({
            role: m.role,
            content: m.content,
            author: m.role === "ASSISTANT" ? ASSISTANT_AUTHOR : user.name,
          })),
        },
      },
    });
    console.log("Created conversation:", created.title, "with", conv.messages.length, "messages");
  }

  console.log("Seed chats done: 3 conversations for", TARGET_EMAIL);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
