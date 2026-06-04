import { isFixedProgram, isFixedProgramId } from "../../utils/programConstants";
import ProgramCard from "./ProgramCard";

function ProgramList({ programs, loading, onEdit, onDelete }) {
    return (
        <>
            <h2>רשימת תוכניות</h2>

            {loading && <p>טוען...</p>}

            {!loading && programs.length === 0 && (
                <p>אין תוכניות במערכת</p>
            )}

            <div className="staff-grid staff-grid--cards staff-grid--compact staff-grid--programs programs-list">
                {programs.map((program) => (
                    <ProgramCard
                        key={program.id}
                        program={program}
                        isFixedProgram={isFixedProgram(program)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </>
    );
}

export default ProgramList;
