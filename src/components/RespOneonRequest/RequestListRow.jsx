function truncateText(text, maxLength = 72) {
  const value = String(text ?? "").trim().replace(/\s+/g, " ");
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}…`;
}

function RequestListRow({
  phone,
  snippet,
  date,
  isSelected,
  isUnread,
  onClick,
}) {
  return (
    <button
      type="button"
      className={[
        "inbox-row",
        isSelected ? "is-selected" : "",
        isUnread ? "inbox-row--unread" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      aria-current={isSelected ? "true" : undefined}
    >
      <span className="inbox-row__main">
        <span className="inbox-row__sender">{phone}</span>
        <span className="inbox-row__snippet">{truncateText(snippet)}</span>
      </span>
      <span className="inbox-row__date">{date}</span>
    </button>
  );
}

export default RequestListRow;
