import {
  buildStaffWhatsAppMessage,
  buildTelUrl,
  formatDisplayDate,
  formatPhoneForDisplay,
  isWhatsAppCapablePhone,
} from "../../utils/RespOneonRequest/formatters";

function RequestDetailPanel({
  request,
  mode = "waiting",
  answer,
  onAnswerChange,
  onSend,
  onMarkAnsweredByPhone,
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
    mode === "waiting" && !useCallInstead && answer.trim()
      ? buildStaffWhatsAppMessage({
          answer,
          content: request.content,
          date: request.date,
        })
      : null;
  const answeredByPhone = request.answerChannel === "phone";

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
              ? answeredByPhone
                ? `נענתה בשיחה: ${formatDisplayDate(request.answeredAt)}`
                : `נענתה: ${formatDisplayDate(request.answeredAt)}`
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
            <h3 className="inbox-detail__label">
              {answeredByPhone ? "מענה בשיחת טלפון" : "התשובה ששלחנו"}
            </h3>
            <p className="inbox-detail__text">{request.answer}</p>
          </section>
        )}

        {mode === "waiting" && (
          <section className="inbox-detail__reply">
            {useCallInstead && (
              <div className="inbox-detail__call-notice" role="status">
                <p className="inbox-detail__call-notice-title">
                  {canUseWhatsApp
                    ? "למספר זה אין וואטסאפ — יש להשיב בשיחת טלפון"
                    : "למספר זה יש להשיב בשיחת טלפון"}
                </p>
                {telUrl && (
                  <a className="inbox-btn inbox-btn--call" href={telUrl}>
                    התקשר/י ל-{formatPhoneForDisplay(request.phone)}
                  </a>
                )}
              </div>
            )}

            <label
              className="inbox-detail__label"
              htmlFor={`answer-${request.id}`}
            >
              {useCallInstead ? "הערות על השיחה (אופציונלי)" : "תשובה ללקוח"}
            </label>
            <textarea
              id={`answer-${request.id}`}
              className="inbox-detail__textarea"
              value={answer}
              placeholder={
                useCallInstead
                  ? "למשל: דיברנו והסברנו על השירות..."
                  : "כתבי תשובה..."
              }
              onChange={(e) => onAnswerChange(e.target.value)}
              rows={5}
              disabled={isSending}
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
              {useCallInstead ? (
                <button
                  type="button"
                  className="inbox-btn inbox-btn--primary"
                  onClick={onMarkAnsweredByPhone}
                  disabled={isSending}
                >
                  {isSending ? "שומר..." : "סמן כנענה בשיחת טלפון"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="inbox-btn inbox-btn--primary"
                    onClick={onSend}
                    disabled={!answer.trim() || isSending}
                  >
                    {isSending ? "שולח..." : "שלח תשובה"}
                  </button>

                  {telUrl ? (
                    <a
                      className="inbox-detail__call-link"
                      href={telUrl}
                      onClick={() => onReportNoWhatsApp?.()}
                    >
                      אין וואטסאפ למספר הזה? התקשר/י
                    </a>
                  ) : null}

                  <button
                    type="button"
                    className="inbox-btn inbox-btn--ghost"
                    onClick={onMarkAnsweredByPhone}
                    disabled={isSending}
                  >
                    {isSending ? "שומר..." : "נענה בשיחת טלפון"}
                  </button>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export default RequestDetailPanel;
