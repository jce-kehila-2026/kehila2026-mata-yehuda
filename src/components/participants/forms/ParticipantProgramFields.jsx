import { useEffect } from "react";
import {
    formatProgramTitle,
    isActivityBasedProgram
} from "../../../utils/staffManegmentUtils/programConstants";

const EDIT_PARTICIPANT_DEBUG_PARTICIPANT_ID = "a6SqVwA9kZHOVcc2lyam";

function ParticipantProgramFields({
    idPrefix,
    form,
    programs,
    activities,
    optionsLoading,
    onProgramChange,
    onActivityChange,
    debugParticipantId = null
}) {
    const selectedProgram = programs.find((program) => program.id === form.program_id);
    const showActivityField = isActivityBasedProgram(selectedProgram);

    useEffect(() => {
        if (debugParticipantId !== EDIT_PARTICIPANT_DEBUG_PARTICIPANT_ID) {
            return;
        }

        console.log("[ParticipantProgramFieldsFinal]", {
            formProgramId: form.program_id,
            programs: programs.map((program) => ({
                id: program.id,
                title: program.title,
                type: program.type
            })),
            selectedProgram
        });
    }, [debugParticipantId, form.program_id, programs, selectedProgram, form]);

    return (
        <>
            <label htmlFor={`${idPrefix}-program`}>תוכנית *</label>
            <select
                id={`${idPrefix}-program`}
                value={form.program_id}
                onChange={(e) => onProgramChange(e.target.value)}
                disabled={optionsLoading}
            >
                <option value="">בחר תוכנית</option>
                {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                        {formatProgramTitle(program)}
                    </option>
                ))}
            </select>

            {showActivityField && (
                <>
                    <label htmlFor={`${idPrefix}-activity`}>פעילות *</label>
                    <select
                        id={`${idPrefix}-activity`}
                        value={form.activity_id}
                        onChange={(e) => onActivityChange(e.target.value)}
                        disabled={optionsLoading}
                    >
                        <option value="">בחר פעילות</option>
                        {activities.map((activity) => (
                            <option key={activity.id} value={activity.id}>
                                {activity.data?.name || "ללא שם"}
                            </option>
                        ))}
                    </select>
                </>
            )}
        </>
    );
}

export default ParticipantProgramFields;
