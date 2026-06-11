import NoWhatsAppNotice from "./NoWhatsAppNotice";
import {
  formatDisplayDate,
  isWhatsAppCapablePhone,
} from "../../utils/RespOneonRequest/formatters";

function RequestCard({
  request,
  answer,
  onAnswerChange,
  onSend,
  onReportNoWhatsApp,
  isSending,
  showNoWhatsAppNotice,
}) {
  const canUseWhatsApp = isWhatsAppCapablePhone(request.phone);
  const showCallInstead = !canUseWhatsApp || showNoWhatsAppNotice;

  return (
    <article className="service-card">
      <h3>פנייה מלקוח</h3>
      <p className="service-card__content">{request.content}</p>

      <dl className="service-card__meta">
        <div>
          <dt>טלפון</dt>
          <dd>{request.phone}</dd>
        </div>
        <div>
          <dt>תאריך פנייה</dt>
          <dd>{formatDisplayDate(request.date)}</dd>
        </div>
      </dl>

      {showCallInstead && <NoWhatsAppNotice phone={request.phone} />}

      <label className="service-card__label" htmlFor={`answer-${request.id}`}>
        תשובה ללקוח
      </label>
      <textarea
        id={`answer-${request.id}`}
        className="service-card__textarea"
        value={answer}
        placeholder="כתבי תשובה..."
        onChange={(e) => onAnswerChange(e.target.value)}
        rows={4}
        disabled={isSending || !canUseWhatsApp}
      />

      <div className="service-card__actions">
        <button
          type="button"
          className="btn-primary"
          onClick={onSend}
          disabled={!answer.trim() || isSending || !canUseWhatsApp}
        >
          {isSending ? "שולח..." : "שלח תשובה"}
        </button>

        {canUseWhatsApp && (
          <button
            type="button"
            className="btn-link"
            onClick={onReportNoWhatsApp}
          >
            אין וואטסאפ למספר הזה? התקשרי
          </button>
        )}
      </div>
    </article>
  );
}

export default RequestCard;
