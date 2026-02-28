#!/usr/bin/env node
/**
 * Commit-msg hook: validates commit messages.
 * Preferred format: <type>: <short description>
 * Types: feat, fix, docs, style, refactor, chore, test, update
 * The type prefix is optional — any message >= 3 chars is accepted.
 */
const fs = require("fs");

const VALID_TYPES = ["feat", "fix", "docs", "style", "refactor", "chore", "test", "update"];
const CONVENTIONAL_REGEX = new RegExp(`^(${VALID_TYPES.join("|")})(\\([^)]+\\))?!?: .+`, "i");
const PLAIN_MSG_REGEX = /^.{3,}/;

// Optional: allow merge commits, revert, etc.
const MERGE_COMMIT = /^Merge .+/;
const REVERT_COMMIT = /^Revert "/;

function main() {
  const msgPath = process.env.HUSKY_GIT_PARAMS?.split(" ")[0] || process.argv[2];
  if (!msgPath || !fs.existsSync(msgPath)) {
    console.error("commit-msg: could not read commit message file");
    process.exit(1);
  }

  const message = fs.readFileSync(msgPath, "utf-8").trim();
  const firstLine = message.split("\n")[0];

  if (MERGE_COMMIT.test(firstLine) || REVERT_COMMIT.test(firstLine)) {
    process.exit(0);
  }

  if (!CONVENTIONAL_REGEX.test(firstLine) && !PLAIN_MSG_REGEX.test(firstLine)) {
    console.error("Commit message must be at least 3 characters.");
    console.error("Preferred format: <type>: <short description>");
    console.error(`  Types: ${VALID_TYPES.join(", ")}`);
    console.error("Example: feat: add login page");
    console.error(`Received: ${firstLine.slice(0, 60)}${firstLine.length > 60 ? "..." : ""}`);
    process.exit(1);
  }

  process.exit(0);
}

main();
