import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { sendFcmNotification } from "./fcmNotifications.js";
import { initializeFirebaseAdmin, verifyActiveStaffUser } from "./firebaseAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const port = Number(process.env.PORT) || 3001;
const defaultDevOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = (
    process.env.CLIENT_ORIGIN?.trim() || defaultDevOrigins.join(",")
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error(`CORS blocked origin: ${origin}`));
        },
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
    let firebaseConfigured = false;

    try {
        initializeFirebaseAdmin();
        firebaseConfigured = true;
    } catch {
        // leave firebaseConfigured false
    }

    res.json({
        ok: true,
        service: "fcm-notifications",
        firebaseConfigured
    });
});

app.post("/api/notifications/send", async (req, res) => {
    const { targetGroup = "all", title = "", body = "" } = req.body || {};

    console.log("[notifications/send] request received", {
        targetGroup,
        hasTitle: Boolean(String(title).trim()),
        hasBody: Boolean(String(body).trim())
    });

    try {
        const staffUser = await verifyActiveStaffUser(req.headers.authorization);

        const result = await sendFcmNotification({
            targetGroup,
            title,
            body,
            sentBy: staffUser.email || staffUser.uid
        });

        console.log("[notifications/send] summary", result);

        return res.json({
            ok: true,
            ...result
        });
    } catch (error) {
        console.error("[notifications/send] error", {
            message: error.message
        });

        if (
            error.message === "MISSING_AUTH_TOKEN" ||
            error.message === "UNAUTHORIZED" ||
            error.message?.includes("auth")
        ) {
            return res.status(401).json({ error: "UNAUTHORIZED" });
        }

        if (error.message === "MESSAGE_BODY_REQUIRED") {
            return res.status(400).json({ error: "MESSAGE_BODY_REQUIRED" });
        }

        if (error.message === "FIREBASE_ADMIN_NOT_CONFIGURED") {
            return res.status(503).json({
                error: "FIREBASE_ADMIN_NOT_CONFIGURED",
                message: "Firebase Admin is not configured on the server"
            });
        }

        return res.status(500).json({
            error: "NOTIFICATION_SEND_FAILED",
            message: error.message || "Notification send failed"
        });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`FCM notification server listening on http://localhost:${port}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});
