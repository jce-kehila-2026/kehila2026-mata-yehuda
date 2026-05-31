import { isDayCenterEntry } from "../../services/programService";
import ProgramCard from "./ProgramCard";

function ProgramList({ programs, loading, onEdit, onDelete }) {
    return (
        <>
            <h2>רשימת תוכניות</h2>

            {loading && <p>טוען...</p>}

            {!loading && programs.length === 0 && (
                <p>אין תוכניות במערכת</p>
            )}

            {programs.map((program) => (
                <ProgramCard
                    key={program.id}
                    program={program}
                    isDayCenter={isDayCenterEntry(program)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </>
    );
}

export default ProgramList;
