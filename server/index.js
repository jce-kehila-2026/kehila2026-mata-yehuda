import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { verifyStaffIdToken } from "./firebaseAuth.js";
import { getWhatsAppEnvStatus, sendBroadcastMessages } from "./whatsappCloudApi.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientOrigin = process.env.CLIENT_ORIGIN?.trim() || "http://localhost:5173";

function buildFailedBroadcastPayload(recipients, errorMessage) {
    const results = recipients.map((recipient) => ({
        participant_id: recipient.participant_id || recipient.id || "",
        phone: recipient.phone || "",
        status: "failed",
        error_message: errorMessage
    }));

    return {
        results,
        summary: {
            total: results.length,
            sent: 0,
            failed: results.length
        }
    };
}

app.use(
    cors({
        origin: clientOrigin,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "whatsapp-broadcast" });
});

app.post("/send-whatsapp-broadcast", async (req, res) => {
    const { title = "", body = "", recipients = [] } = req.body || {};
    const recipientCount = Array.isArray(recipients) ? recipients.length : 0;

    console.log("[send-whatsapp-broadcast] request received", {
        recipientCount,
        hasTitle: Boolean(String(title).trim()),
        hasBody: Boolean(String(body).trim())
    });

    console.log("[send-whatsapp-broadcast] env status", getWhatsAppEnvStatus());

    try {
        await verifyStaffIdToken(req.headers.authorization);

        if (!body?.trim()) {
            console.log("[send-whatsapp-broadcast] rejected: MESSAGE_BODY_REQUIRED");
            return res.status(400).json({ error: "MESSAGE_BODY_REQUIRED" });
        }

        if (!Array.isArray(recipients) || recipients.length === 0) {
            console.log("[send-whatsapp-broadcast] rejected: RECIPIENTS_REQUIRED");
            return res.status(400).json({ error: "RECIPIENTS_REQUIRED" });
        }

        const payload = await sendBroadcastMessages({
            title: String(title),
            body: String(body),
            recipients
        });

        for (const result of payload.results) {
            console.log("[send-whatsapp-broadcast] recipient result", {
                participant_id: result.participant_id,
                phone: result.phone,
                status: result.status,
                error_message: result.error_message || ""
            });
        }

        console.log("[send-whatsapp-broadcast] summary", payload.summary);

        return res.json(payload);
    } catch (error) {
        console.error("[send-whatsapp-broadcast] error", {
            message: error.message,
            recipientCount
        });

        const failedPayload = buildFailedBroadcastPayload(
            Array.isArray(recipients) ? recipients : [],
            error.message || "Broadcast failed"
        );

        if (
            error.message === "MISSING_AUTH_TOKEN" ||
            error.message?.includes("auth")
        ) {
            return res.status(401).json({ error: "UNAUTHORIZED" });
        }

        if (
            error.message === "WHATSAPP_CONFIG_MISSING" ||
            error.message === "WHATSAPP_TEMPLATE_NAME_REQUIRED" ||
            error.message === "FIREBASE_ADMIN_NOT_CONFIGURED"
        ) {
            console.log("[send-whatsapp-broadcast] summary", failedPayload.summary);

            return res.status(503).json({
                error: error.message,
                message: "WhatsApp or Firebase Admin is not configured on the server",
                ...failedPayload
            });
        }

        console.log("[send-whatsapp-broadcast] summary", failedPayload.summary);

        return res.status(500).json({
            error: "BROADCAST_FAILED",
            message: error.message || "Broadcast failed",
            ...failedPayload
        });
    }
});

app.listen(port, () => {
    console.log(`WhatsApp broadcast server listening on http://localhost:${port}`);
    console.log("[startup] env status", getWhatsAppEnvStatus());
});
