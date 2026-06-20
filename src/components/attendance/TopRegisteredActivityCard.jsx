import { formatActivityDisplayDate } from "../../services/attendance/attendanceService";

function TopActivityMedal({ rank }) {
  if (rank === 1) {
    return (
      <svg
        className="attendance-records-page__top-card-medal attendance-records-page__top-card-medal--gold"
        viewBox="0 0 48 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M13 2L18 20L24 15L30 20L35 2L24 8L13 2Z"
          fill="#e8b923"
        />
        <path
          d="M16 4L20 18L24 14L28 18L32 4L24 9L16 4Z"
          fill="#f5d547"
        />
        <circle cx="24" cy="38" r="15" fill="#f0c419" stroke="#c9920a" strokeWidth="2" />
        <circle cx="24" cy="38" r="11.5" fill="url(#top-medal-gold-shine)" />
        <ellipse cx="20" cy="34" rx="4" ry="2.5" fill="rgba(255,255,255,0.45)" />
        <text
          x="24"
          y="42"
          textAnchor="middle"
          fill="#9a6b00"
          fontSize="13"
          fontWeight="800"
          fontFamily="Heebo, system-ui, sans-serif"
        >
          1
        </text>
        <defs>
          <radialGradient id="top-medal-gold-shine" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffe566" />
            <stop offset="100%" stopColor="#e8b923" />
          </radialGradient>
        </defs>
      </svg>
    );
  }

  if (rank === 2) {
    return (
      <svg
        className="attendance-records-page__top-card-medal attendance-records-page__top-card-medal--silver"
        viewBox="0 0 48 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M13 2L18 20L24 15L30 20L35 2L24 8L13 2Z"
          fill="#b8c0c8"
        />
        <path
          d="M16 4L20 18L24 14L28 18L32 4L24 9L16 4Z"
          fill="#d8dee4"
        />
        <circle cx="24" cy="38" r="15" fill="#c5ccd4" stroke="#98a2ad" strokeWidth="2" />
        <circle cx="24" cy="38" r="11.5" fill="url(#top-medal-silver-shine)" />
        <ellipse cx="20" cy="34" rx="4" ry="2.5" fill="rgba(255,255,255,0.5)" />
        <text
          x="24"
          y="42"
          textAnchor="middle"
          fill="#5f6b76"
          fontSize="13"
          fontWeight="800"
          fontFamily="Heebo, system-ui, sans-serif"
        >
          2
        </text>
        <defs>
          <radialGradient id="top-medal-silver-shine" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#eef1f4" />
            <stop offset="100%" stopColor="#c5ccd4" />
          </radialGradient>
        </defs>
      </svg>
    );
  }

  if (rank === 3) {
    return (
      <svg
        className="attendance-records-page__top-card-medal attendance-records-page__top-card-medal--bronze"
        viewBox="0 0 48 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M13 2L18 20L24 15L30 20L35 2L24 8L13 2Z"
          fill="#c2784a"
        />
        <path
          d="M16 4L20 18L24 14L28 18L32 4L24 9L16 4Z"
          fill="#e8a86d"
        />
        <circle cx="24" cy="38" r="15" fill="#cd7f32" stroke="#a8642a" strokeWidth="2" />
        <circle cx="24" cy="38" r="11.5" fill="url(#top-medal-bronze-shine)" />
        <ellipse cx="20" cy="34" rx="4" ry="2.5" fill="rgba(255,255,255,0.35)" />
        <text
          x="24"
          y="42"
          textAnchor="middle"
          fill="#7a4518"
          fontSize="13"
          fontWeight="800"
          fontFamily="Heebo, system-ui, sans-serif"
        >
          3
        </text>
        <defs>
          <radialGradient id="top-medal-bronze-shine" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e8a86d" />
            <stop offset="100%" stopColor="#cd7f32" />
          </radialGradient>
        </defs>
      </svg>
    );
  }

  return (
    <span className="attendance-records-page__top-card-rank-fallback" aria-hidden="true">
      #{rank}
    </span>
  );
}

function TopRegisteredActivityCard({ activityStat, rank, onSelect }) {
  const displayDate =
    formatActivityDisplayDate(activityStat.activityDate) || "—";
  const hasRegistrants = activityStat.registeredCount > 0;

  const handleSelect = () => {
    onSelect?.(activityStat.activityId);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  const cardClassName = [
    "attendance-records-page__top-card",
    rank === 1 && "attendance-records-page__top-card--rank-1",
    rank === 2 && "attendance-records-page__top-card--rank-2",
    rank === 3 && "attendance-records-page__top-card--rank-3",
    !hasRegistrants && "attendance-records-page__top-card--zero",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={cardClassName}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      aria-label={`דירוג ${rank}, ${activityStat.registeredCount} נרשמים, ${activityStat.activityName}`}
    >
      <span className="attendance-records-page__top-card-medal-wrap">
        <TopActivityMedal rank={rank} />
      </span>

      <span className="attendance-records-page__top-card-name">
        {activityStat.activityName}
      </span>

      <span className="attendance-records-page__top-card-date">{displayDate}</span>

      <span className="attendance-records-page__top-card-count-block">
        <span className="attendance-records-page__top-card-count-value">
          {activityStat.registeredCount}
        </span>
        <span className="attendance-records-page__top-card-count-label">נרשמים</span>
      </span>
    </button>
  );
}

export default TopRegisteredActivityCard;
