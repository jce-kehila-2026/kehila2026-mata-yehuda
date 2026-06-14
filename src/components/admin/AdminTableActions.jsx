import { CircleDollarSign, Eye, Pencil, Trash2 } from "lucide-react";

function AdminTableIconButton({
    icon: Icon,
    label,
    variant = "neutral",
    onClick,
    disabled = false
}) {
    return (
        <button
            type="button"
            className={`admin-table-action admin-table-action--${variant}`}
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
        >
            <Icon className="admin-table-action__icon" strokeWidth={2} aria-hidden="true" />
        </button>
    );
}

export function AdminTableActions({ children }) {
    return <div className="admin-data-table__actions admin-data-table__actions--compact">{children}</div>;
}

export function AdminTableEditButton({
    onClick,
    label = "עריכה",
    disabled = false
}) {
    return (
        <AdminTableIconButton
            icon={Pencil}
            label={label}
            variant="edit"
            onClick={onClick}
            disabled={disabled}
        />
    );
}

export function AdminTableViewButton({
    onClick,
    label = "צפייה בפרטים",
    disabled = false
}) {
    return (
        <AdminTableIconButton
            icon={Eye}
            label={label}
            variant="view"
            onClick={onClick}
            disabled={disabled}
        />
    );
}

export function AdminTableDeleteButton({
    onClick,
    label = "מחיקה",
    disabled = false
}) {
    return (
        <AdminTableIconButton
            icon={Trash2}
            label={label}
            variant="delete"
            onClick={onClick}
            disabled={disabled}
        />
    );
}

export function AdminTableProcessButton({
    onClick,
    label = "עיבוד החזר",
    disabled = false
}) {
    return (
        <AdminTableIconButton
            icon={CircleDollarSign}
            label={label}
            variant="process"
            onClick={onClick}
            disabled={disabled}
        />
    );
}
