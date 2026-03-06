import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distPath = path.join(projectRoot, "dist");

try {
  await rm(distPath, { recursive: true, force: true });
  console.log(`Cleaned ${distPath}`);
} catch (error) {
  console.error(`Failed to clean ${distPath}:`, error);
  process.exitCode = 1;
}
