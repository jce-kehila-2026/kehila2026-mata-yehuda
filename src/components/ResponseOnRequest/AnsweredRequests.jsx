import { formatDisplayDate } from "../../utils/RespOneonRequest/formatters";

function truncateText(text, maxLength = 60) {
  const value = String(text ?? "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}…`;
}

function AnsweredRequests({ requests, expandedId, onExpandedChange }) {
  if (requests.length === 0) {
    return <p className="requests-empty section-description">אין פניות שנענו עדיין.</p>;
  }

  return (
    <ul className="answered-list">
      {requests.map((request) => {
        const isOpen = expandedId === request.id;

        return (
          <li key={request.id} className={`answered-card ${isOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="answered-card__toggle"
              onClick={() => onExpandedChange(isOpen ? null : request.id)}
              aria-expanded={isOpen}
            >
              <span className="answered-card__summary">
                <span>{request.phone}</span>
                <span className="answered-card__date">
                  {formatDisplayDate(request.answeredAt)}
                </span>
              </span>
              {!isOpen && (
                <span className="answered-card__preview">
                  {truncateText(request.content)}
                </span>
              )}
              <span className="answered-card__chevron" aria-hidden>
                {isOpen ? "▲" : "▼"}
              </span>
            </button>

            {isOpen && (
              <div className="answered-card__body">
                <section className="answered-card__block">
                  <h3 className="answered-card__label">הפנייה</h3>
                  <p className="answered-card__content">{request.content}</p>
                  <p className="answered-card__sub">
                    <strong>תאריך פנייה:</strong>{" "}
                    {formatDisplayDate(request.date)}
                  </p>
                </section>

                <section className="answered-card__block answered-card__block--answer">
                  <h3 className="answered-card__label">התשובה ששלחנו</h3>
                  <p className="answered-card__answer">{request.answer}</p>
                </section>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default AnsweredRequests;
