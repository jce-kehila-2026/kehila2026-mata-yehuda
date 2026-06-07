import StaffNavigationSections from "./StaffNavigationSections";

function DashboardSidebar({
    actionsById,
    actionIcons,
    currentPage,
    onNavigate,
    isOpen = false,
    onClose,
    onItemActivate
}) {
    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div
                className="staff-dashboard-desktop-overlay"
                onClick={onClose}
                aria-hidden="true"
            />
            <aside
                id="staff-dashboard-sidebar-drawer"
                className="staff-dashboard-sidebar staff-dashboard-sidebar--drawer"
                aria-label="ניווט לוח בקרה"
                role="dialog"
                aria-modal="true"
            >
                <div className="staff-dashboard-sidebar__header">
                    <h2 className="staff-dashboard-sidebar__title">תפריט ניווט</h2>
                    <button
                        type="button"
                        className="staff-dashboard-sidebar__close"
                        onClick={onClose}
                        aria-label="סגירת תפריט"
                    >
                        ×
                    </button>
                </div>
                <nav className="staff-dashboard-sidebar-nav">
                    <StaffNavigationSections
                        variant="sidebar"
                        actionsById={actionsById}
                        actionIcons={actionIcons}
                        currentPage={currentPage}
                        onNavigate={onNavigate}
                        onItemActivate={() => {
                            onItemActivate?.();
                            onClose?.();
                        }}
                    />
                </nav>
            </aside>
        </>
    );
}

export default DashboardSidebar;
