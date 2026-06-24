import { UserRoundCheck } from "lucide-react";

const REACTIVATE_LABEL = "הפעל מחדש";

export default function ReactivateVolunteerButton({
    onClick,
    label = REACTIVATE_LABEL,
    disabled = false
}) {
    return (
        <button
            type="button"
            className="admin-table-action admin-table-action--reactivate"
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
        >
            <UserRoundCheck
                className="admin-table-action__icon"
                strokeWidth={2}
                aria-hidden="true"
            />
        </button>
    );
}

export { REACTIVATE_LABEL };
