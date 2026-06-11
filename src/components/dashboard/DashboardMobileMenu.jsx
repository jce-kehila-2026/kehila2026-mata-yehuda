import { LogOut, Menu } from "lucide-react";
import StaffNavigationSections from "./StaffNavigationSections";

function DashboardMobileMenu({
    isOpen,
    onOpen,
    onClose,
    currentPage,
    actionsById,
    actionIcons,
    onNavigate,
    onLogout
}) {
    return (
        <>
            <button
                type="button"
                className={
                    isOpen
                        ? "staff-mobile-menu-toggle staff-mobile-menu-toggle--open"
                        : "staff-mobile-menu-toggle"
                }
                onClick={() => (isOpen ? onClose() : onOpen())}
                aria-label="פתיחת תפריט צוות"
                aria-expanded={isOpen}
                aria-controls="staff-mobile-menu-drawer"
            >
                <Menu
                    className="staff-mobile-menu-toggle__icon"
                    strokeWidth={2}
                    aria-hidden="true"
                />
                <span className="staff-mobile-menu-toggle__label">תפריט צוות</span>
            </button>

            {isOpen ? (
                <>
                    <div
                        className="staff-mobile-menu-overlay"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <aside
                        id="staff-mobile-menu-drawer"
                        className="staff-mobile-menu-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="staff-mobile-menu-drawer-title"
                    >
                        <div className="staff-mobile-menu-drawer-header">
                            <h2 id="staff-mobile-menu-drawer-title">תפריט צוות</h2>
                            <button
                                type="button"
                                className="staff-mobile-menu-drawer-close"
                                onClick={onClose}
                                aria-label="סגירת תפריט"
                            >
                                ×
                            </button>
                        </div>

                        <nav
                            className="staff-mobile-menu-body"
                            aria-label="תפריט צוות"
                        >
                            <StaffNavigationSections
                                variant="mobile"
                                actionsById={actionsById}
                                actionIcons={actionIcons}
                                currentPage={currentPage}
                                onNavigate={onNavigate}
                                onItemActivate={onClose}
                            />
                        </nav>

                        <div className="staff-mobile-menu-footer">
                            <button
                                type="button"
                                className="staff-mobile-menu-logout"
                                onClick={() => {
                                    onClose();
                                    onLogout();
                                }}
                            >
                                <LogOut
                                    className="staff-mobile-menu-logout__icon"
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                                <span>התנתקות</span>
                            </button>
                        </div>
                    </aside>
                </>
            ) : null}
        </>
    );
}

export default DashboardMobileMenu;
