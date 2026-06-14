import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(__dirname, "../../server");
const targetDir = resolve(__dirname, "../src-server");

if (!existsSync(serverDir)) {
  console.error("Missing ../server directory");
  process.exit(1);
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });

for (const entry of [
  "server.js",
  "index.js",
  "firebaseAuth.js",
  "fcmNotifications.js",
  "notificationTargeting.js",
]) {
  cpSync(resolve(serverDir, entry), resolve(targetDir, entry));
}

console.log("Synced server code into functions/src-server");
