import { useState, useEffect, useRef } from "react";
import {
    BarChart3,
    Calendar,
    CheckCircle2,
    ClipboardList,
    FileText,
    HandHeart,
    Mail,
    MessageCircle,
    Undo2,
    UserRound,
    Users
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import ManageActivities from "./ManageActivities";
import ManageStaff from "./ManageStaff";
import ManagePrograms from "./ManagePrograms";
import ManageParticipants from "./ManageParticipants";
import ViewRegistrations from "./ViewRegistrations";
import ManageCancellations from "./ManageCancellations";
import SendMessages from "./SendMessages";
import ViewStatistics from "./ViewStatistics";
import DashboardControlPanels from "../components/dashboard/DashboardControlPanels";
import { fetchDashboardOverview } from "../services/dashboardService";
import {
    applyStaffPopState,
    createStaffNavStack,
    getStaffSection,
    getStaffView,
    getStepsBackToDashboard,
    parseStaffPage,
    pushStaffNavStack,
    pushStaffPage,
    replaceStaffPage,
    staffNavigateToDashboard
} from "../utils/staffNavigation";

const DASHBOARD_ACTION_ICONS = {
    activities: Calendar,
    programs: ClipboardList,
    manageStaff: Users,
    manageParticipants: UserRound,
    messages: MessageCircle,
    statistics: BarChart3,
    registrations: FileText,
    inquiries: Mail,
    cancellations: Undo2,
    attendance: CheckCircle2,
    volunteers: HandHeart
};

const DASHBOARD_ACTIONS = [
    { id: "activities", label: "ניהול פעילויות", page: "activities" },
    { id: "programs", label: "ניהול תוכניות", page: "programs" },
    { id: "manageStaff", label: "ניהול אנשי צוות", page: "manageStaff" },
    {
        id: "manageParticipants",
        label: "ניהול משתתפים",
        page: "manageParticipants"
    },
    { id: "messages", label: "שליחת הודעות", page: "messages" },
    { id: "statistics", label: "צפייה בסטטיסטיקות", page: null },
    {
        id: "registrations",
        label: "צפייה בבקשות",
        page: "registrations"
    },
    { id: "inquiries", label: "צפיה בפניות", page: null },
    { id: "cancellations", label: "ניהול ביטולים", page: "cancellations" },
    { id: "attendance", label: "בדיקת נוכחות", page: null },
    { id: "volunteers", label: "ניהול מתנדבים", page: null }
];

const DASHBOARD_SUMMARY_LABELS = [
    { id: "open-activities", label: "פעילויות פתוחות" },
    { id: "pending-requests", label: "בקשות ממתינות" },
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
    statistics: "צפייה בסטטיסטיקות",
    attendance: "בדיקת נוכחות"
};

function StaffDashboard({ onLogout }) {
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [dashboardOverview, setDashboardOverview] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const staffNavStackRef = useRef(createStaffNavStack("dashboard"));

    useEffect(() => {
        if (currentPage !== "dashboard") {
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
                            staffView={getStaffView(currentPage, "menu")}
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
                            participantView={getStaffView(currentPage, "menu")}
                            onNavigate={goToPage}
                        />
                    </div>
                );
            case "registrations":
                return (
                    <div data-dashboard-page="registrations">
                        {renderSubpageToolbar(SUBPAGE_TITLES.registrations)}
                        <ViewRegistrations
                            registrationView={getStaffView(currentPage, "list")}
                            onNavigate={goToPage}
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
            case "statistics":
                return (
                    <div data-dashboard-page="statistics">
                        {renderSubpageToolbar(SUBPAGE_TITLES.statistics)}
                        <ViewStatistics />
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
        <div className="staff-page staff-page--dashboard">
            {currentPage === "dashboard" && (
                <div className="staff-dashboard-page">
                    <header className="staff-dashboard-hero">
                        <div className="staff-dashboard-hero__bar">
                            <h1 className="staff-dashboard-title">לוח בקרה לצוות</h1>
                            <button
                                type="button"
                                className="staff-dashboard-logout"
                                onClick={handleLogout}
                            >
                                התנתקות
                            </button>
                        </div>

                        <div className="staff-dashboard-hero__intro">
                            <p className="staff-dashboard-subtitle">
                                גישה מהירה לניהול פעילויות, משתתפים, בקשות והודעות
                            </p>
                        </div>

                        <div className="staff-dashboard-actions">
                            {DASHBOARD_ACTIONS.map((action) => {
                                const ActionIcon = DASHBOARD_ACTION_ICONS[action.id];

                                return (
                                    <button
                                        key={action.id}
                                        type="button"
                                        className="staff-dashboard-circle"
                                        onClick={
                                            action.page
                                                ? () =>
                                                      handleDashboardAction(
                                                          action.page
                                                      )
                                                : undefined
                                        }
                                    >
                                        <span
                                            className="staff-dashboard-icon"
                                            aria-hidden="true"
                                        >
                                            {ActionIcon ? (
                                                <ActionIcon
                                                    className="staff-dashboard-icon__svg"
                                                    strokeWidth={2}
                                                />
                                            ) : null}
                                        </span>
                                        <span className="staff-dashboard-label">
                                            {action.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </header>

                    <main className="staff-dashboard-content">
                        <section className="staff-dashboard-summary">
                            <h2 className="staff-dashboard-section-title">סיכום מהיר</h2>
                            <div className="staff-dashboard-summary-grid">
                                {DASHBOARD_SUMMARY_LABELS.map((item) => (
                                    <article
                                        key={item.id}
                                        className="staff-dashboard-summary-card"
                                    >
                                        <span className="staff-dashboard-summary-card__value">
                                            {getSummaryValue(item.id)}
                                        </span>
                                        <span className="staff-dashboard-summary-card__label">
                                            {item.label}
                                        </span>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <DashboardControlPanels
                            overview={dashboardOverview}
                            loading={dashboardLoading}
                            onNavigate={handleDashboardAction}
                        />
                    </main>
                </div>
            )}

            {currentPage !== "dashboard" && (
                <div className="staff-subpage">{renderCurrentPage()}</div>
            )}
        </div>
    );
}

export default StaffDashboard;
