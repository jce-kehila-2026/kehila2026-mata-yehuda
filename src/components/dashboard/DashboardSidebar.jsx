import StaffNavigationSections from "./StaffNavigationSections";

function DashboardSidebar({
    actionsById,
    actionIcons,
    currentPage,
    onNavigate
}) {
    return (
        <aside className="staff-dashboard-sidebar" aria-label="ניווט לוח בקרה">
            <nav className="staff-dashboard-sidebar-nav">
                <StaffNavigationSections
                    variant="sidebar"
                    actionsById={actionsById}
                    actionIcons={actionIcons}
                    currentPage={currentPage}
                    onNavigate={onNavigate}
                />
            </nav>
        </aside>
    );
}

export default DashboardSidebar;
