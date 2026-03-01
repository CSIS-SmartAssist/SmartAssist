// Skip husky in CI/Vercel (no git hooks needed there)
if (process.env.CI === "true" || process.env.VERCEL === "1") {
  process.exit(0);
}
try {
  require("child_process").execSync("husky", { stdio: "inherit" });
} catch {
  process.exit(0);
}
