export function getWhatsAppEnvStatus() {
    const phoneNumberId = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID?.trim());
    const accessToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN?.trim());
    const templateName = Boolean(process.env.WHATSAPP_TEMPLATE_NAME?.trim());
    const messageMode = process.env.WHATSAPP_MESSAGE_MODE?.trim() || "template";

    return {
        WHATSAPP_PHONE_NUMBER_ID: phoneNumberId,
        WHATSAPP_ACCESS_TOKEN: accessToken,
        WHATSAPP_TEMPLATE_NAME: templateName,
        WHATSAPP_MESSAGE_MODE: messageMode,
        firebaseProjectId: Boolean(process.env.FIREBASE_PROJECT_ID?.trim()),
        googleApplicationCredentials: Boolean(
            process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()
        )
    };
}

function getConfig() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
    const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION?.trim() || "v21.0";
    const messageMode = process.env.WHATSAPP_MESSAGE_MODE?.trim() || "template";
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim();
    const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "he";

    if (!phoneNumberId || !accessToken) {
        throw new Error("WHATSAPP_CONFIG_MISSING");
    }

    if (messageMode === "template" && !templateName) {
        throw new Error("WHATSAPP_TEMPLATE_NAME_REQUIRED");
    }

    return {
        phoneNumberId,
        accessToken,
        apiVersion,
        messageMode,
        templateName,
        templateLanguage
    };
}

export function normalizePhoneForApi(phone) {
    const digits = String(phone || "").replace(/\D/g, "");

    if (!digits) {
        return "";
    }

    if (digits.startsWith("972")) {
        return digits;
    }

    if (digits.startsWith("0")) {
        return `972${digits.slice(1)}`;
    }

    return digits;
}

function buildMessagePayload({ to, title, body, config }) {
    if (config.messageMode === "text") {
        const textBody = [title?.trim(), body?.trim()].filter(Boolean).join("\n\n");

        return {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: {
                body: textBody
            }
        };
    }

    const parameters = [];

    if (title?.trim()) {
        parameters.push({ type: "text", text: title.trim() });
    }

    if (body?.trim()) {
        parameters.push({ type: "text", text: body.trim() });
    }

    if (!parameters.length) {
        parameters.push({ type: "text", text: " " });
    }

    return {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
            name: config.templateName,
            language: {
                code: config.templateLanguage
            },
            components: [
                {
                    type: "body",
                    parameters
                }
            ]
        }
    };
}

export async function sendWhatsAppCloudMessage({ phone, title, body }) {
    const config = getConfig();
    const to = normalizePhoneForApi(phone);

    if (!to || to.length < 10) {
        throw new Error("INVALID_PHONE");
    }

    const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
    const payload = buildMessagePayload({ to, title, body, config });

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMessage =
            data?.error?.message ||
            data?.error?.error_user_msg ||
            `WhatsApp API error (${response.status})`;

        throw new Error(errorMessage);
    }

    return data;
}

export async function sendBroadcastMessages({ title, body, recipients }) {
    console.log("[whatsapp-broadcast] starting recipient loop", {
        recipientCount: recipients.length
    });

    const results = [];

    for (const recipient of recipients) {
        const participantId = recipient.participant_id || recipient.id || "";
        const phone = recipient.phone || "";

        try {
            await sendWhatsAppCloudMessage({ phone, title, body });
            results.push({
                participant_id: participantId,
                phone,
                status: "sent",
                error_message: ""
            });
            console.log("[whatsapp-broadcast] recipient sent", {
                participant_id: participantId,
                phone
            });
        } catch (error) {
            results.push({
                participant_id: participantId,
                phone,
                status: "failed",
                error_message: error.message || "Send failed"
            });
            console.log("[whatsapp-broadcast] recipient failed", {
                participant_id: participantId,
                phone,
                error_message: error.message || "Send failed"
            });
        }
    }

    const sent = results.filter((item) => item.status === "sent").length;
    const failed = results.filter((item) => item.status === "failed").length;

    console.log("[whatsapp-broadcast] loop complete", {
        total: results.length,
        sent,
        failed
    });

    return {
        results,
        summary: {
            total: results.length,
            sent,
            failed
        }
    };
}
