import { useEffect, useState } from "react";
import { fetchPrograms } from "../../../services/staffManegmentServices/programService";
import { fetchActivities } from "../../../services/staffManegmentServices/activityService";

export function useParticipantForm() {
    const [programs, setPrograms] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        async function loadOptions() {
            setLoading(true);
            setLoadError("");
            try {
                const [programsData, activitiesData] = await Promise.all([
                    fetchPrograms(),
                    fetchActivities()
                ]);
                setPrograms(programsData);
                setActivities(activitiesData);
            } catch (err) {
                console.log(err);
                setLoadError("שגיאה בטעינת תוכניות או פעילויות");
            } finally {
                setLoading(false);
            }
        }

        loadOptions();
    }, []);

    return { programs, activities, loading, loadError };
}
