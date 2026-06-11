function AdminListEmptyState({ icon: Icon, title, message, actionLabel, onAction }) {
    return (
        <div className="admin-list-empty">
            {Icon ? (
                <span className="admin-list-empty__icon" aria-hidden="true">
                    <Icon strokeWidth={1.75} />
                </span>
            ) : null}
            <h3 className="admin-list-empty__title">{title}</h3>
            <p className="admin-list-empty__message">{message}</p>
            {actionLabel && onAction ? (
                <button
                    type="button"
                    className="staff-button staff-button--secondary"
                    onClick={onAction}
                >
                    {actionLabel}
                </button>
            ) : null}
        </div>
    );
}

export default AdminListEmptyState;
