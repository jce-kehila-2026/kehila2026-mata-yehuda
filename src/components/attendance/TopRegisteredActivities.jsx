import { useMemo, useState } from "react";
import {
  getTopRegisteredActivities,
  TOP_REGISTERED_LIMIT_OPTIONS,
} from "../../services/attendanceService";
import TopRegisteredActivityCard from "./TopRegisteredActivityCard";

const DEFAULT_TOP_LIMIT = TOP_REGISTERED_LIMIT_OPTIONS[0];

function TopRegisteredActivities({ activityStats, onActivitySelect }) {
  const [topLimit, setTopLimit] = useState(DEFAULT_TOP_LIMIT);

  const topActivities = useMemo(
    () => getTopRegisteredActivities(activityStats, topLimit),
    [activityStats, topLimit]
  );

  return (
    <div className="attendance-records-page__section">
      <div className="attendance-records-page__section-header">
        <h2 className="attendance-records-page__section-title">
          הפעילויות עם מספר הנרשמים הגבוה ביותר
        </h2>

        <select
          id="attendance-top-limit"
          className="attendance-records-page__top-limit-select"
          value={topLimit}
          onChange={(event) => setTopLimit(Number(event.target.value))}
          aria-label="מספר הפעילויות המובילות להצגה"
        >
          {TOP_REGISTERED_LIMIT_OPTIONS.map((limitOption) => (
            <option key={limitOption} value={limitOption}>
              Top {limitOption}
            </option>
          ))}
        </select>
      </div>

      {topActivities.length === 0 ? (
        <div className="attendance-records-page__card">
          <p className="attendance-records-page__empty">אין פעילויות להצגה.</p>
        </div>
      ) : (
        <div className="attendance-records-page__top-grid">
          {topActivities.map((activityStat) => (
            <TopRegisteredActivityCard
              key={activityStat.activityId}
              activityStat={activityStat}
              onSelect={onActivitySelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TopRegisteredActivities;
