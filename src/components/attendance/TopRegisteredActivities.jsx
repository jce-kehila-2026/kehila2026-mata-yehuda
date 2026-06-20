import { useMemo } from "react";
import {
  getTopRegisteredActivities,
  TOP_REGISTERED_LIMIT_OPTIONS,
} from "../../services/attendance/attendanceService";
import TopRegisteredActivityCard from "./TopRegisteredActivityCard";

const TOP_ACTIVITIES_DISPLAY_COUNT = TOP_REGISTERED_LIMIT_OPTIONS[0];

function TopRegisteredActivities({ activityStats, onActivitySelect }) {
  const topActivities = useMemo(
    () => getTopRegisteredActivities(activityStats, TOP_ACTIVITIES_DISPLAY_COUNT),
    [activityStats]
  );

  return (
    <div className="attendance-records-page__section attendance-records-page__section--top-highlight">
      <h2 className="attendance-records-page__section-title">
        הפעילויות עם מספר הנרשמים הגבוה ביותר
      </h2>

      {topActivities.length === 0 ? (
        <div className="attendance-records-page__card attendance-records-page__top-empty">
          <p className="attendance-records-page__empty">אין פעילויות להצגה.</p>
        </div>
      ) : (
        <div className="attendance-records-page__top-grid">
          {topActivities.map((activityStat, index) => (
            <TopRegisteredActivityCard
              key={activityStat.activityId}
              activityStat={activityStat}
              rank={index + 1}
              onSelect={onActivitySelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TopRegisteredActivities;
