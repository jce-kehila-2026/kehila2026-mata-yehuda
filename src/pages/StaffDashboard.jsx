import { useState, useEffect, useRef } from "react";
import {
    Calendar,
    CheckCircle2,
    ClipboardList,
    FileText,
    HandHeart,
    Mail,
    Menu,
    MessageCircle,
    Undo2,
    UserRound,
    Users
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import DashboardMobileMenu from "../components/dashboard/DashboardMobileMenu";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import ManageActivities from "./ManageActivities";
import ManageStaff from "./ManageStaff";
import ManagePrograms from "./ManagePrograms";
import ManageParticipants from "./ManageParticipants";
import ViewRegistrations from "./ViewRegistrations";
import ManageCancellations from "./ManageCancellations";
import SendMessages from "./SendMessages";
import DashboardControlPanels from "../components/dashboard/DashboardControlPanels";
import { fetchDashboardOverview } from "../services/dashboardService";
import {
    applyStaffPopState,
    buildStaffPage,
    createStaffNavStack,
    getStaffSection,
    getStaffView,
    getStepsBackToDashboard,
    parseStaffPage,
    pushStaffNavStack,
    pushStaffPage,
    replaceStaffPage,
    staffNavigateToDashboard,
    STAFF_PENDING_REGISTRATION_ID_KEY,
    STAFF_CANCELLATION_ID_KEY,
    STAFF_RETURN_PAGE_KEY
} from "../utils/staffNavigation";
import { useMediaQuery } from "../hooks/useMediaQuery";

const DASHBOARD_ACTION_ICONS = {
    activities: Calendar,
    programs: ClipboardList,
    manageStaff: Users,
    manageParticipants: UserRound,
    messages: MessageCircle,
    registrations: FileText,
    inquiries: Mail,
    cancellations: Undo2,
    attendance: CheckCircle2,
    volunteers: HandHeart
};

const DASHBOARD_ACTIONS = [
    { id: "activities", label: "פעילויות", page: "activities" },
    { id: "programs", label: "תוכניות", page: "programs" },
    { id: "manageStaff", label: "אנשי צוות", page: "manageStaff" },
    {
        id: "manageParticipants",
        label: "משתתפים",
        page: "manageParticipants"
    },
    { id: "messages", label: "הודעות", page: "messages" },
    {
        id: "registrations",
        label: "בקשות",
        page: "registrations"
    },
    { id: "inquiries", label: "פניות", page: null },
    { id: "cancellations", label: "ביטולים", page: "cancellations" },
    { id: "attendance", label: "נוכחות", page: null },
    { id: "volunteers", label: "מתנדבים", page: null }
];

const DASHBOARD_ACTIONS_BY_ID = Object.fromEntries(
    DASHBOARD_ACTIONS.map((action) => [action.id, action])
);

const DASHBOARD_SUMMARY_LABELS = [
    { id: "pending-requests", label: "בקשות ממתינות" },
    { id: "open-activities", label: "פעילויות פתוחות" },
    { id: "sent-messages", label: "הודעות שנשלחו" }
];

const SUBPAGE_TITLES = {
    activities: "ניהול פעילויות",
    manageStaff: "ניהול אנשי צוות",
    programs: "ניהול תוכניות",
    manageParticipants: "ניהול משתתפים",
    registrations: "צפייה בבקשות",
    cancellations: "ניהול ביטולים",
    messages: "שליחת הודעות",
    attendance: "בדיקת נוכחות"
};

function StaffDashboard({ onLogout }) {
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [dashboardOverview, setDashboardOverview] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
    const [dashboardSuccessMessage, setDashboardSuccessMessage] = useState("");
    const isMobileDashboard = useMediaQuery("(max-width: 768px)");
    const staffNavStackRef = useRef(createStaffNavStack("dashboard"));
    const dashboardNavRef = useRef(null);
    const desktopNavRef = useRef(null);

    function closeDashboardNav() {
        setIsMobileActionsOpen(false);
    }

    function closeDesktopSidebar() {
        setIsDesktopSidebarOpen(false);
    }

    useEffect(() => {
        if (!isMobileDashboard) {
            setIsMobileActionsOpen(false);
        } else {
            setIsDesktopSidebarOpen(false);
        }
    }, [isMobileDashboard]);

    useEffect(() => {
        const shouldLockScroll =
            (isMobileActionsOpen && isMobileDashboard) ||
            (isDesktopSidebarOpen && !isMobileDashboard);

        if (!shouldLockScroll) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileActionsOpen, isDesktopSidebarOpen, isMobileDashboard]);

    useEffect(() => {
        if (!isMobileActionsOpen && !isDesktopSidebarOpen) {
            return undefined;
        }

        function handlePointerDown(event) {
            const clickedInsideMobileNav =
                dashboardNavRef.current &&
                dashboardNavRef.current.contains(event.target);
            const clickedInsideDesktopNav =
                desktopNavRef.current &&
                desktopNavRef.current.contains(event.target);

            if (isMobileActionsOpen && !clickedInsideMobileNav) {
                closeDashboardNav();
            }

            if (
                isDesktopSidebarOpen &&
                !isMobileDashboard &&
                !clickedInsideDesktopNav
            ) {
                closeDesktopSidebar();
            }
        }

        document.addEventListener("mousedown", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
        };
    }, [isMobileActionsOpen, isDesktopSidebarOpen, isMobileDashboard]);

    useEffect(() => {
        if (currentPage !== "dashboard") {
            setIsMobileActionsOpen(false);
            setIsDesktopSidebarOpen(false);
            return undefined;
        }

        let cancelled = false;

        setDashboardLoading(true);

        fetchDashboardOverview()
            .then((data) => {
                if (!cancelled) {
                    setDashboardOverview(data);
                    setDashboardLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setDashboardOverview(null);
                    setDashboardLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [currentPage]);

    useEffect(() => {
        replaceStaffPage("dashboard");
        staffNavStackRef.current = createStaffNavStack("dashboard");

        function handlePopState(event) {
            const nextStaffPage =
                event?.state?.staffPage ?? parseStaffPage(event?.state);
            setCurrentPage(nextStaffPage);
            staffNavStackRef.current = applyStaffPopState(
                staffNavStackRef.current,
                nextStaffPage
            );
        }

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    async function handleLogout() {
        await signOut(auth);
        onLogout();
        console.log("logout clicked");
    }

    function goToPage(page) {
        if (page === currentPage) {
            return;
        }

        setDashboardSuccessMessage("");

        if (page === "dashboard") {
            const stepsBack = getStepsBackToDashboard(staffNavStackRef.current);
            staffNavigateToDashboard(stepsBack);
            setCurrentPage("dashboard");
            staffNavStackRef.current = createStaffNavStack("dashboard");
            return;
        }

        setCurrentPage(page);
        pushStaffPage(page);
        staffNavStackRef.current = pushStaffNavStack(
            staffNavStackRef.current,
            page
        );
    }

    function goToDashboard() {
        goToPage("dashboard");
    }

    function goToCompleteRegistration(request) {
        const registrationId = request?.registrationId;

        if (!registrationId) {
            return;
        }

        const page = buildStaffPage("registrations", "complete");
        setCurrentPage(page);
        pushStaffPage(page, {
            [STAFF_PENDING_REGISTRATION_ID_KEY]: registrationId,
            [STAFF_RETURN_PAGE_KEY]: "dashboard"
        });
        staffNavStackRef.current = pushStaffNavStack(
            staffNavStackRef.current,
            page
        );
    }

    function goToManageCancellation(item) {
        const cancellationId = item?.cancellation?.id;

        if (!cancellationId) {
            return;
        }

        setCurrentPage("cancellations");
        pushStaffPage("cancellations", {
            [STAFF_CANCELLATION_ID_KEY]: cancellationId,
            [STAFF_RETURN_PAGE_KEY]: "dashboard"
        });
        staffNavStackRef.current = pushStaffNavStack(
            staffNavStackRef.current,
            "cancellations"
        );
    }

    function handleReturnToDashboardAfterComplete() {
        setDashboardSuccessMessage("הרישום הושלם בהצלחה");
        goToPage("dashboard");
    }

    function renderSubpageToolbar(pageTitle) {
        return (
            <div className="staff-subpage-toolbar">
                <h2 className="staff-subpage-title">{pageTitle}</h2>
                <button
                    type="button"
                    className="staff-back-button"
                    onClick={goToDashboard}
                >
                    <span className="staff-back-button__icon" aria-hidden="true">
                        →
                    </span>
                    חזרה ללוח הבקרה
                </button>
            </div>
        );
    }

    function renderPlaceholderPage(title) {
        return (
            <>
                {renderSubpageToolbar(title)}
                <div className="staff-page">
                    <header className="staff-header">
                        <h1>{title}</h1>
                        <p>העמוד בפיתוח</p>
                    </header>
                    <div className="staff-container" />
                </div>
            </>
        );
    }

    function renderCurrentPage() {
        const section = getStaffSection(currentPage);

        switch (section) {
            case "activities":
                return (
                    <div data-dashboard-page="activities">
                        {renderSubpageToolbar(SUBPAGE_TITLES.activities)}
                        <ManageActivities
                            activityView={getStaffView(currentPage, "list")}
                            onNavigate={goToPage}
                        />
                    </div>
                );
            case "manageStaff":
                return (
                    <div data-dashboard-page="manageStaff">
                        {renderSubpageToolbar(SUBPAGE_TITLES.manageStaff)}
                        <ManageStaff
                            staffView={getStaffView(currentPage, "list")}
                            onNavigate={goToPage}
                        />
                    </div>
                );
            case "programs":
                return (
                    <div data-dashboard-page="programs">
                        {renderSubpageToolbar(SUBPAGE_TITLES.programs)}
                        <ManagePrograms
                            programView={getStaffView(currentPage, "list")}
                            onNavigate={goToPage}
                        />
                    </div>
                );
            case "manageParticipants":
                return (
                    <div data-dashboard-page="manageParticipants">
                        {renderSubpageToolbar(SUBPAGE_TITLES.manageParticipants)}
                        <ManageParticipants
                            participantView={getStaffView(currentPage, "list")}
                            onNavigate={goToPage}
                        />
                    </div>
                );
            case "registrations":
                return (
                    <div data-dashboard-page="registrations">
                        {getStaffView(currentPage, "list") !== "complete"
                            ? renderSubpageToolbar(SUBPAGE_TITLES.registrations)
                            : null}
                        <ViewRegistrations
                            registrationView={getStaffView(currentPage, "list")}
                            onNavigate={goToPage}
                            onReturnToDashboard={handleReturnToDashboardAfterComplete}
                        />
                    </div>
                );
            case "cancellations":
                return (
                    <div data-dashboard-page="cancellations">
                        {renderSubpageToolbar(SUBPAGE_TITLES.cancellations)}
                        <ManageCancellations />
                    </div>
                );
            case "messages":
                return (
                    <div data-dashboard-page="messages">
                        {renderSubpageToolbar(SUBPAGE_TITLES.messages)}
                        <SendMessages />
                    </div>
                );
            case "attendance":
                return renderPlaceholderPage("בדיקת נוכחות");
            case "dashboard":
                return null;
            default:
                return (
                    <div data-dashboard-page={currentPage}>
                        {renderSubpageToolbar("עמוד לא נמצא")}
                        <div className="staff-container">
                            <p>עמוד לא נמצא</p>
                        </div>
                    </div>
                );
        }
    }

    function handleDashboardAction(page) {
        if (page) {
            goToPage(page);
        }
    }

    function getSummaryValue(summaryId) {
        if (dashboardLoading) {
            return "…";
        }

        if (!dashboardOverview) {
            return "—";
        }

        switch (summaryId) {
            case "open-activities":
                return dashboardOverview.upcomingActivityCount;
            case "pending-requests":
                return dashboardOverview.pendingCount;
            case "sent-messages":
                return dashboardOverview.sentMessageCount;
            default:
                return "—";
        }
    }

    return (
        <div
            className={
                currentPage === "dashboard"
                    ? "staff-page staff-page--dashboard"
                    : "staff-page"
            }
        >
            {currentPage === "dashboard" && (
                <div className="staff-dashboard-page staff-dashboard-page--home">
                    <header className="staff-dashboard-hero">
                        <div className="staff-dashboard-hero__bar">
                            <div className="staff-dashboard-hero__start">
                                <div
                                    className="staff-dashboard-hero__mobile-nav"
                                    ref={dashboardNavRef}
                                >
                                    <DashboardMobileMenu
                                        isOpen={isMobileActionsOpen}
                                        onOpen={() =>
                                            setIsMobileActionsOpen(true)
                                        }
                                        onClose={closeDashboardNav}
                                        currentPage={currentPage}
                                        actionsById={DASHBOARD_ACTIONS_BY_ID}
                                        actionIcons={DASHBOARD_ACTION_ICONS}
                                        onNavigate={handleDashboardAction}
                                        onLogout={handleLogout}
                                    />
                                </div>
                                <div
                                    className="staff-dashboard-hero__desktop-nav"
                                    ref={desktopNavRef}
                                >
                                    <button
                                        type="button"
                                        className={
                                            isDesktopSidebarOpen
                                                ? "staff-dashboard-desktop-menu-toggle staff-dashboard-desktop-menu-toggle--open"
                                                : "staff-dashboard-desktop-menu-toggle"
                                        }
                                        onClick={() =>
                                            setIsDesktopSidebarOpen((open) => !open)
                                        }
                                        aria-label="פתיחת תפריט ניווט"
                                        aria-expanded={isDesktopSidebarOpen}
                                        aria-controls="staff-dashboard-sidebar-drawer"
                                    >
                                        <Menu
                                            className="staff-dashboard-desktop-menu-toggle__icon"
                                            strokeWidth={2}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    <DashboardSidebar
                                        isOpen={
                                            isDesktopSidebarOpen &&
                                            !isMobileDashboard
                                        }
                                        onClose={closeDesktopSidebar}
                                        actionsById={DASHBOARD_ACTIONS_BY_ID}
                                        actionIcons={DASHBOARD_ACTION_ICONS}
                                        currentPage={currentPage}
                                        onNavigate={handleDashboardAction}
                                    />
                                </div>
                                <h1 className="staff-dashboard-title">
                                    לוח בקרה לצוות
                                </h1>
                            </div>
                            <button
                                type="button"
                                className="staff-dashboard-logout staff-dashboard-logout--hero"
                                onClick={handleLogout}
                            >
                                התנתקות
                            </button>
                        </div>
                    </header>

                    <div className="staff-dashboard-layout">
                        <main className="staff-dashboard-main staff-dashboard-content">
                        {dashboardSuccessMessage ? (
                            <p className="staff-alert staff-alert--success staff-dashboard-success">
                                {dashboardSuccessMessage}
                            </p>
                        ) : null}
                        <section className="staff-dashboard-summary staff-dashboard-summary--primary">
                            <h2 className="staff-dashboard-section-title">סיכום מהיר</h2>
                            <div className="staff-dashboard-summary-grid">
                                {DASHBOARD_SUMMARY_LABELS.map((item) => (
                                    <article
                                        key={item.id}
                                        className="staff-dashboard-summary-card"
                                    >
                                        <span className="staff-dashboard-summary-card__label">
                                            {item.label}
                                        </span>
                                        <span className="staff-dashboard-summary-card__value">
                                            {getSummaryValue(item.id)}
                                        </span>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <DashboardControlPanels
                            overview={dashboardOverview}
                            loading={dashboardLoading}
                            onNavigate={handleDashboardAction}
                            onCompleteRegistration={goToCompleteRegistration}
                            onManageCancellation={goToManageCancellation}
                        />
                        </main>
                    </div>
                </div>
            )}

            {currentPage !== "dashboard" && (
                <div className="staff-subpage">{renderCurrentPage()}</div>
            )}
        </div>
    );
}

export default StaffDashboard;
