#!/usr/bin/env node
/**
 * Commit-msg hook: enforce conventional commit format.
 * Format: <type>: <short description>
 * Types: feat, fix, docs, style, refactor, chore, test
 * See CONTRIBUTING.md.
 */
const fs = require("fs");

const VALID_TYPES = ["feat", "fix", "docs", "style", "refactor", "chore", "test", "update"];
const COMMIT_MSG_REGEX = new RegExp(`^(${VALID_TYPES.join("|")})(\\([^)]+\\))?!?: .+`, "i");

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

  if (!COMMIT_MSG_REGEX.test(firstLine)) {
    console.error("Commit message must follow Conventional Commits:");
    console.error("  <type>: <short description>");
    console.error(`  Types: ${VALID_TYPES.join(", ")}`);
    console.error("Example: feat: add login page");
    console.error(`Received: ${firstLine.slice(0, 60)}${firstLine.length > 60 ? "..." : ""}`);
    process.exit(1);
  }

  process.exit(0);
}

main();
