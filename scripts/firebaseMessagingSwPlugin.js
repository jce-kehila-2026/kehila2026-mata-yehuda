import { loadEnv } from "vite";
import { generateFirebaseMessagingSw } from "./generateFirebaseMessagingSw.js";

export function firebaseMessagingSwPlugin() {
    let envMode = "development";
    let envDir = process.cwd();

    return {
        name: "firebase-messaging-sw",
        config(config) {
            envMode = config.mode || "development";
            envDir = config.envDir || process.cwd();
        },
        configResolved(config) {
            envMode = config.mode;
            envDir = config.envDir;
        },
        buildStart() {
            const env = loadEnv(envMode, envDir, "");
            generateFirebaseMessagingSw(env);
        },
        configureServer(server) {
            const env = loadEnv(envMode, envDir, "");
            generateFirebaseMessagingSw(env);

            server.watcher.on("change", (filePath) => {
                if (
                    filePath.endsWith(".env") ||
                    filePath.endsWith(".env.local") ||
                    filePath.endsWith(".env.development") ||
                    filePath.endsWith(".env.development.local")
                ) {
                    const nextEnv = loadEnv(envMode, envDir, "");
                    generateFirebaseMessagingSw(nextEnv);
                }
            });
        }
    };
}
