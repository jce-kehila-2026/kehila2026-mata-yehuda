import { getFixedProgramTitle, resolveCanonicalProgramId } from "../../../utils/programConstants";

export const CONSENT_FIELD_PAIRS = [
    ["is_subscribed", "isSubscribed"],
    ["subscribed", "subscribed"],
    ["wants_messages", "wantsMessages"],
    ["marketing_consent", "marketingConsent"]
];

export const WHATSAPP_COMPLIANCE_NOTE =
    "שליחת הודעות WhatsApp מתבצעת רק למשתתפים שאישרו קבלת הודעות.";

export const WHATSAPP_BACKEND_REQUIRED_MESSAGE =
    "שליחת WhatsApp אמיתית דורשת חיבור לשרת WhatsApp Business API";

export function formatParticipantDisplayName(participant) {
    const firstName = participant?.first_name || "";
    const lastName = participant?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "—";
}

export function resolveProgramTitle(programId, programs = []) {
    const canonicalId = resolveCanonicalProgramId(programId);

    if (!canonicalId) {
        return "";
    }

    const program = programs.find((item) => item.id === canonicalId);

    if (program?.title) {
        return program.title;
    }

    return getFixedProgramTitle(canonicalId) || "";
}

export function normalizePhoneForWhatsApp(phone) {
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

export function isValidWhatsAppPhone(phone) {
    const normalized = normalizePhoneForWhatsApp(phone);

    return normalized.length >= 10;
}

export function buildMessageText(title, body) {
    const trimmedTitle = title?.trim() || "";
    const trimmedBody = body?.trim() || "";

    if (trimmedTitle && trimmedBody) {
        return `${trimmedTitle}\n\n${trimmedBody}`;
    }

    return trimmedTitle || trimmedBody;
}

export function getParticipantConsentValue(participant) {
    if (!participant) {
        return null;
    }

    for (const [snakeKey, camelKey] of CONSENT_FIELD_PAIRS) {
        if (participant[snakeKey] !== undefined && participant[snakeKey] !== null) {
            return Boolean(participant[snakeKey]);
        }

        if (participant[camelKey] !== undefined && participant[camelKey] !== null) {
            return Boolean(participant[camelKey]);
        }
    }

    return null;
}

export function participantHasMarketingConsent(participant) {
    const consent = getParticipantConsentValue(participant);

    return consent === true;
}

export function buildMessageRecipient(participant, programs = []) {
    const programId = participant.program_id || "";
    const recipient = {
        id: participant.id,
        fullName: formatParticipantDisplayName(participant),
        phone: String(participant.phone || "").trim(),
        programId,
        programTitle: resolveProgramTitle(programId, programs)
    };

    for (const [snakeKey, camelKey] of CONSENT_FIELD_PAIRS) {
        if (participant[snakeKey] !== undefined) {
            recipient[snakeKey] = participant[snakeKey];
        }

        if (participant[camelKey] !== undefined) {
            recipient[camelKey] = participant[camelKey];
        }
    }

    return recipient;
}

export function filterBroadcastRecipients(recipients) {
    return recipients.filter(
        (recipient) =>
            isValidWhatsAppPhone(recipient.phone) &&
            participantHasMarketingConsent(recipient)
    );
}

export function validateBroadcastMessage({ body, recipients }) {
    if (!body?.trim()) {
        return "יש להזין תוכן הודעה";
    }

    if (!recipients.length) {
        return "לא נמצאו נמענים עם טלפון תקין והסכמה לשליחה";
    }

    return "";
}

export function formatBroadcastSummary({ sent, failed, total }) {
    return `נשלחו ${sent} מתוך ${total}\nנכשלו ${failed}`;
}

export function toBroadcastRecipientPayload(recipients) {
    return recipients.map((recipient) => ({
        participant_id: recipient.id,
        phone: recipient.phone
    }));
}
