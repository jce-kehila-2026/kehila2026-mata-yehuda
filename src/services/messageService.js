import { db, auth } from "../config/firebase";
import {
    addDoc,
    collection,
    doc,
    Timestamp,
    updateDoc,
    writeBatch
} from "firebase/firestore";
import { fetchParticipantsWithRegistrations } from "./participantService";
import { fetchPrograms } from "./programService";
import {
    buildMessageRecipient,
    CONSENT_FIELD_PAIRS,
    getParticipantConsentValue,
    toBroadcastRecipientPayload,
    WHATSAPP_BACKEND_REQUIRED_MESSAGE
} from "../components/messages/helpers/messageHelpers";

const messagesCollection = collection(db, "messages");
const messageLogsCollection = collection(db, "message_logs");
const FIRESTORE_BATCH_LIMIT = 500;
const WHATSAPP_API_CHANNEL = "whatsapp_api";

function getBroadcastApiBase() {
    return import.meta.env.VITE_WHATSAPP_BROADCAST_API_URL?.trim().replace(/\/$/, "") || "";
}

function getBroadcastApiUrl() {
    const base = getBroadcastApiBase();

    return base ? `${base}/send-whatsapp-broadcast` : "/send-whatsapp-broadcast";
}

function getBroadcastHealthUrl() {
    const base = getBroadcastApiBase();

    return base ? `${base}/health` : "/health";
}

function mapBroadcastApiError(response, data) {
    const errorCode = data?.error || "";

    if (response.status === 401 || errorCode === "UNAUTHORIZED") {
        return "NOT_AUTHENTICATED";
    }

    if (response.status === 503) {
        return (
            data?.message ||
            "שרת WhatsApp לא מוגדר. הפעל את שרת השליחה והגדר משתני סביבה."
        );
    }

    if (
        response.status === 502 ||
        response.status === 504 ||
        errorCode === "BROADCAST_FAILED" ||
        !data?.message
    ) {
        return WHATSAPP_BACKEND_REQUIRED_MESSAGE;
    }

    if (data.message === "BROADCAST_API_FAILED") {
        return WHATSAPP_BACKEND_REQUIRED_MESSAGE;
    }

    return data.message;
}

function buildFailedResultsFromRecipients(recipients, errorMessage) {
    return recipients.map((recipient) => ({
        participant_id: recipient.id,
        phone: recipient.phone,
        status: "failed",
        error_message: errorMessage
    }));
}

function normalizeApiResults(results, recipients) {
    if (Array.isArray(results) && results.length > 0) {
        return results.map((item) => ({
            participant_id: item.participant_id || "",
            phone: item.phone || "",
            status: item.status === "sent" ? "sent" : "failed",
            error_message: item.error_message || ""
        }));
    }

    return buildFailedResultsFromRecipients(
        recipients,
        WHATSAPP_BACKEND_REQUIRED_MESSAGE
    );
}

function computeCampaignStatus(summary, recipients) {
    const total = summary?.total ?? recipients.length;
    const failed = summary?.failed ?? total;
    const sent = summary?.sent ?? 0;

    if (sent > 0 && failed > 0) {
        return "sent";
    }

    return failed === total ? "failed" : "sent";
}

async function assertWhatsAppBroadcastBackendAvailable() {
    try {
        const response = await fetch(getBroadcastHealthUrl(), {
            method: "GET",
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(WHATSAPP_BACKEND_REQUIRED_MESSAGE);
        }

        const data = await response.json().catch(() => ({}));

        if (data.ok !== true) {
            throw new Error(WHATSAPP_BACKEND_REQUIRED_MESSAGE);
        }
    } catch (error) {
        if (error.message === WHATSAPP_BACKEND_REQUIRED_MESSAGE) {
            throw error;
        }

        throw new Error(WHATSAPP_BACKEND_REQUIRED_MESSAGE);
    }
}

export function getConsentFilteringStatus(participants) {
    const hasConsentField = participants.some(
        (participant) => getParticipantConsentValue(participant) !== null
    );

    return {
        hasConsentField,
        consentFilteringEnabled: hasConsentField
    };
}

export async function fetchMessageRecipientSource() {
    const [participants, programs] = await Promise.all([
        fetchParticipantsWithRegistrations(),
        fetchPrograms()
    ]);

    const recipients = participants.map((participant) =>
        buildMessageRecipient(participant, programs)
    );

    return {
        recipients,
        consentStatus: getConsentFilteringStatus(participants)
    };
}

async function createMessageCampaign({ title, body, recipientCount, status }) {
    const authorId = auth.currentUser?.uid || "";

    return addDoc(messagesCollection, {
        title: title?.trim() || "",
        body: body?.trim() || "",
        recipient_count: recipientCount,
        created_at: Timestamp.now(),
        created_by: authorId,
        channel: WHATSAPP_API_CHANNEL,
        status
    });
}

async function createMessageLogs(messageId, results) {
    const createdAt = Timestamp.now();
    const logEntries = [];

    for (let offset = 0; offset < results.length; offset += FIRESTORE_BATCH_LIMIT) {
        const chunk = results.slice(offset, offset + FIRESTORE_BATCH_LIMIT);
        const batch = writeBatch(db);

        for (const result of chunk) {
            const logRef = doc(messageLogsCollection);
            const sent = result.status === "sent";

            batch.set(logRef, {
                message_id: messageId,
                participant_id: result.participant_id || "",
                phone: result.phone || "",
                channel: WHATSAPP_API_CHANNEL,
                status: sent ? "sent" : "failed",
                error_message: result.error_message || "",
                created_at: createdAt,
                sent_at: sent ? createdAt : null
            });

            logEntries.push({ logRef, participant_id: result.participant_id });
        }

        await batch.commit();
    }

    return logEntries;
}

async function updateMessageCampaignStatus(messageRef, status) {
    await updateDoc(messageRef, { status });
}

async function callWhatsAppBroadcastApi({ title, body, recipients }) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("NOT_AUTHENTICATED");
    }

    const idToken = await currentUser.getIdToken();

    let response;

    try {
        response = await fetch(getBroadcastApiUrl(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
            },
            body: JSON.stringify({
                title: title?.trim() || "",
                body: body?.trim() || "",
                recipients: toBroadcastRecipientPayload(recipients)
            })
        });
    } catch {
        return {
            ok: false,
            errorMessage: WHATSAPP_BACKEND_REQUIRED_MESSAGE,
            results: buildFailedResultsFromRecipients(
                recipients,
                WHATSAPP_BACKEND_REQUIRED_MESSAGE
            ),
            summary: {
                total: recipients.length,
                sent: 0,
                failed: recipients.length
            }
        };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMessage = mapBroadcastApiError(response, data);

        return {
            ok: false,
            errorMessage,
            status: response.status,
            results: normalizeApiResults(data.results, recipients).map((item) => ({
                ...item,
                status: "failed",
                error_message: item.error_message || errorMessage
            })),
            summary: data.summary || {
                total: recipients.length,
                sent: 0,
                failed: recipients.length
            }
        };
    }

    return {
        ok: true,
        results: normalizeApiResults(data.results, recipients),
        summary: data.summary || {
            total: recipients.length,
            sent: 0,
            failed: recipients.length
        }
    };
}

export async function sendWhatsAppBroadcast({ title, body, recipients }) {
    await assertWhatsAppBroadcastBackendAvailable();

    const messageRef = await createMessageCampaign({
        title,
        body,
        recipientCount: recipients.length,
        status: "sending"
    });

    const messageId = messageRef.id;
    let apiOutcome;

    try {
        apiOutcome = await callWhatsAppBroadcastApi({
            title,
            body,
            recipients
        });
    } catch (error) {
        apiOutcome = {
            ok: false,
            errorMessage: error.message || WHATSAPP_BACKEND_REQUIRED_MESSAGE,
            results: buildFailedResultsFromRecipients(
                recipients,
                error.message || WHATSAPP_BACKEND_REQUIRED_MESSAGE
            ),
            summary: {
                total: recipients.length,
                sent: 0,
                failed: recipients.length
            }
        };
    }

    const finalStatus = computeCampaignStatus(apiOutcome.summary, recipients);

    try {
        await createMessageLogs(messageId, apiOutcome.results);
        await updateMessageCampaignStatus(messageRef, finalStatus);
    } catch (logError) {
        console.error("[sendWhatsAppBroadcast] message_logs write failed", logError);

        try {
            await createMessageLogs(
                messageId,
                buildFailedResultsFromRecipients(
                    recipients,
                    logError.message || "Failed to save message logs"
                )
            );
        } catch (retryError) {
            console.error(
                "[sendWhatsAppBroadcast] message_logs retry failed",
                retryError
            );
        }

        await updateMessageCampaignStatus(messageRef, "failed");
        throw logError;
    }

    if (!apiOutcome.ok) {
        const error = new Error(apiOutcome.errorMessage || WHATSAPP_BACKEND_REQUIRED_MESSAGE);
        error.status = apiOutcome.status;
        throw error;
    }

    const { sent = 0, failed = 0, total = recipients.length } = apiOutcome.summary;

    return {
        messageId,
        results: apiOutcome.results,
        summary: {
            total,
            sent,
            failed
        }
    };
}
