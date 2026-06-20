import {
  buildStaffWhatsAppMessage,
  buildTelUrl,
  formatDisplayDate,
  isWhatsAppCapablePhone,
} from "../../utils/RespOneonRequest/formatters";

function RequestDetailPanel({
  request,
  mode = "waiting",
  answer,
  onAnswerChange,
  onSend,
  onReportNoWhatsApp,
  isSending,
  showNoWhatsAppNotice,
  onBack,
}) {
  const canUseWhatsApp = isWhatsAppCapablePhone(request.phone);
  const telUrl = buildTelUrl(request.phone);
  const useCallInstead =
    mode === "waiting" && (!canUseWhatsApp || showNoWhatsAppNotice);
  const whatsappPreview =
    mode === "waiting" && answer.trim()
      ? buildStaffWhatsAppMessage({
          answer,
          content: request.content,
          date: request.date,
        })
      : null;

  return (
    <article className="inbox-detail">
      <header className="inbox-detail__header">
        {onBack && (
          <button
            type="button"
            className="inbox-detail__back"
            onClick={onBack}
            aria-label="חזרה לרשימה"
          >
            →
          </button>
        )}
        <div className="inbox-detail__header-main">
          <h2 className="inbox-detail__title">{request.phone}</h2>
          <p className="inbox-detail__meta">
            {mode === "answered"
              ? `נענתה: ${formatDisplayDate(request.answeredAt)}`
              : `פנייה: ${formatDisplayDate(request.date)}`}
          </p>
        </div>
      </header>

      <div className="inbox-detail__body">
        <section className="inbox-detail__message">
          <h3 className="inbox-detail__label">הפנייה</h3>
          <p className="inbox-detail__text">{request.content}</p>
          {mode === "answered" && (
            <p className="inbox-detail__sub">
              תאריך פנייה: {formatDisplayDate(request.date)}
            </p>
          )}
        </section>

        {mode === "answered" && (
          <section className="inbox-detail__message inbox-detail__message--answer">
            <h3 className="inbox-detail__label">התשובה ששלחנו</h3>
            <p className="inbox-detail__text">{request.answer}</p>
          </section>
        )}

        {mode === "waiting" && (
          <section className="inbox-detail__reply">
            <label
              className="inbox-detail__label"
              htmlFor={`answer-${request.id}`}
            >
              תשובה ללקוח
            </label>
            <textarea
              id={`answer-${request.id}`}
              className="inbox-detail__textarea"
              value={answer}
              placeholder="כתבי תשובה..."
              onChange={(e) => onAnswerChange(e.target.value)}
              rows={5}
              disabled={isSending || useCallInstead}
            />

            {whatsappPreview && (
              <div className="inbox-detail__whatsapp-preview">
                <h4 className="inbox-detail__label">
                  כך תיראה ההודעה בוואטסאפ
                </h4>
                <pre className="inbox-detail__whatsapp-preview-text">
                  {whatsappPreview}
                </pre>
              </div>
            )}

            <div className="inbox-detail__actions">
              <button
                type="button"
                className="inbox-btn inbox-btn--primary"
                onClick={onSend}
                disabled={!answer.trim() || isSending || useCallInstead}
              >
                {isSending ? "שולח..." : "שלח תשובה"}
              </button>

              {telUrl ? (
                <a
                  className="inbox-detail__call-link"
                  href={telUrl}
                  onClick={() => {
                    if (canUseWhatsApp) {
                      onReportNoWhatsApp?.();
                    }
                  }}
                >
                  אין וואטסאפ למספר הזה? התקשר/י
                </a>
              ) : (
                <span className="inbox-detail__call-link inbox-detail__call-link--static">
                  אין וואטסאפ למספר הזה? התקשר/י
                </span>
              )}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export default RequestDetailPanel;
