function MessageForm({
    title,
    body,
    complianceNote,
    recipientCount,
    consentedCount,
    onTitleChange,
    onBodyChange
}) {
    return (
        <div className="staff-form message-form">
            {complianceNote && <p className="staff-list-count">{complianceNote}</p>}

            <label htmlFor="message-title">כותרת הודעה</label>
            <input
                id="message-title"
                type="text"
                placeholder="כותרת (אופציונלי)"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
            />

            <label htmlFor="message-body">תוכן ההודעה *</label>
            <textarea
                id="message-body"
                placeholder="תוכן ההודעה"
                value={body}
                onChange={(e) => onBodyChange(e.target.value)}
            />

            <p className="staff-list-count">
                נמענים לשליחה: {recipientCount} מתוך {consentedCount} משתתפים שאישרו קבלת
                הודעות
            </p>
        </div>
    );
}

export default MessageForm;
