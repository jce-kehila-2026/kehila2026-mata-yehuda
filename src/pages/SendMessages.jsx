import { useCallback, useEffect, useMemo, useState } from "react";
import MessageForm from "../components/messages/forms/MessageForm";
import {
    filterBroadcastRecipients,
    formatBroadcastSummary,
    participantHasMarketingConsent,
    validateBroadcastMessage,
    WHATSAPP_BACKEND_REQUIRED_MESSAGE,
    WHATSAPP_COMPLIANCE_NOTE
} from "../components/messages/helpers/messageHelpers";
import {
    fetchMessageRecipientSource,
    sendWhatsAppBroadcast
} from "../services/messageService";

function SendMessages() {
    const [allRecipients, setAllRecipients] = useState([]);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadRecipients = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await fetchMessageRecipientSource();
            setAllRecipients(data.recipients);
        } catch (err) {
            console.error(err);
            setError("שגיאה בטעינת נמענים");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRecipients();
    }, [loadRecipients]);

    const recipients = useMemo(
        () => filterBroadcastRecipients(allRecipients),
        [allRecipients]
    );

    const consentedCount = useMemo(
        () =>
            allRecipients.filter((recipient) =>
                participantHasMarketingConsent(recipient)
            ).length,
        [allRecipients]
    );

    async function handleSendToAll() {
        setError("");
        setSuccess("");

        const validationError = validateBroadcastMessage({
            body,
            recipients
        });

        if (validationError) {
            setError(validationError);
            return;
        }

        setSending(true);

        try {
            const result = await sendWhatsAppBroadcast({
                title,
                body,
                recipients
            });

            const { sent, failed, total } = result.summary;
            setSuccess(formatBroadcastSummary({ sent, failed, total }));
        } catch (err) {
            console.error(err);

            if (err.message === "NOT_AUTHENTICATED") {
                setError("יש להתחבר מחדש כדי לשלוח הודעות");
            } else if (err.message === WHATSAPP_BACKEND_REQUIRED_MESSAGE) {
                setError(err.message);
            } else if (err.status === 503) {
                setError(
                    err.message ||
                        "שרת WhatsApp לא מוגדר. הפעל את שרת השליחה והגדר משתני סביבה."
                );
            } else {
                setError(err.message || "שגיאה בשליחת ההודעות");
            }
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="staff-page staff-page--messages">
            <header className="staff-header">
                <h1>שליחת הודעות</h1>
            </header>

            <div className="staff-container">
                {error && <p className="staff-alert staff-alert--error">{error}</p>}
                {success && (
                    <p className="staff-alert staff-alert--success" style={{ whiteSpace: "pre-line" }}>
                        {success}
                    </p>
                )}
                {loading && <p className="staff-meta">טוען נמענים...</p>}

                {!loading && (
                    <section className="staff-section">
                        <MessageForm
                            title={title}
                            body={body}
                            complianceNote={WHATSAPP_COMPLIANCE_NOTE}
                            recipientCount={recipients.length}
                            consentedCount={consentedCount}
                            onTitleChange={setTitle}
                            onBodyChange={setBody}
                        />

                        <div className="staff-actions staff-actions--inline message-actions">
                            <button
                                type="button"
                                className="staff-button"
                                onClick={handleSendToAll}
                                disabled={sending || recipients.length === 0}
                            >
                                {sending ? "שולח..." : "שליחה לכל המשתתפים"}
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default SendMessages;
