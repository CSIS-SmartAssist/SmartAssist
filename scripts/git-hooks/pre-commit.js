#!/usr/bin/env node
/**
 * Pre-commit hook: branch name validation.
 * Allows: main, development, and branches matching ^(feature|bugfix|update|release)/[a-z0-9._-]+$
 * See CONTRIBUTING.md for workflow.
 */
const { execSync } = require("child_process");

const VALID_BRANCH_REGEX = /^(feature|bugfix|update|release)\/[a-z0-9._-]+$/;
const STANDARD_BRANCHES = ["main", "development", "HEAD"];

function getRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
  } catch {
    return process.cwd();
  }
}

function main() {
  try {
    const localBranch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
      cwd: getRoot(),
    }).trim();

    console.log("RUNNING PRE-COMMIT: branch name validation");

    if (STANDARD_BRANCHES.includes(localBranch) || VALID_BRANCH_REGEX.test(localBranch)) {
      process.exit(0);
    }

    console.error(
      "Branch name is invalid. Branch names must match: ^(feature|bugfix|update|release)/[a-z0-9._-]+$"
    );
    console.error("Protected branches (main, development) are also allowed.");
    console.error("Your commit will be rejected. Rename your branch and try again.");
    console.error(`Current branch: ${localBranch}`);
    process.exit(1);
  } catch (error) {
    console.error("Error running pre-commit hook:", error.message);
    process.exit(1);
  }
}

main();
