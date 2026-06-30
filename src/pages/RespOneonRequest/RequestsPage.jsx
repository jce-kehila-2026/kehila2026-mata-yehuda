import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Mail } from "lucide-react";

import RequestDetailPanel from "../../components/RespOneonRequest/RequestDetailPanel";
import RequestListRow from "../../components/RespOneonRequest/RequestListRow";
import {
  getAllRequests,
  markRequestAsAnswered,
  markRequestAsAnsweredByPhone,
} from "../../services/RespOneonRequest/requestsService";
import "../../styles/RespOneonRequest/requests.css";
import {
  buildStaffWhatsAppMessage,
  formatDisplayDate,
  isWhatsAppCapablePhone,
  openWhatsAppChat,
  sortAnsweredRequests,
  sortWaitingRequests,
} from "../../utils/RespOneonRequest/formatters";

const TAB = {
  waiting: "waiting",
  answered: "answered",
};

function isToday(value) {
  if (!value) return false;

  let date;
  if (typeof value?.toDate === "function") {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function RequestsPage({ onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB.waiting);
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [noWhatsAppRequestId, setNoWhatsAppRequestId] = useState(null);

  const loadRequests = async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
      setError("לא ניתן לטעון את הפניות. נסי לרענן את הדף.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    (async () => {
      setError(null);

      try {
        const data = await getAllRequests();
        if (isActive) {
          setRequests(data);
        }
      } catch (err) {
        console.error("Failed to load requests:", err);
        if (isActive) {
          setError("לא ניתן לטעון את הפניות. נסי לרענן את הדף.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  const waiting = useMemo(
    () =>
      sortWaitingRequests(
        requests.filter((request) => request.status === "waiting"),
      ),
    [requests],
  );

  const answered = useMemo(
    () =>
      sortAnsweredRequests(
        requests.filter((request) => request.status === "answered"),
      ),
    [requests],
  );

  const todayCount = useMemo(
    () => requests.filter((request) => isToday(request.date)).length,
    [requests],
  );

  const activeList = activeTab === TAB.waiting ? waiting : answered;

  useEffect(() => {
    if (activeList.length === 0) {
      setSelectedId(null);
      setMobileDetailOpen(false);
      return;
    }

    if (!activeList.some((request) => request.id === selectedId)) {
      setSelectedId(activeList[0].id);
    }
  }, [activeList, selectedId]);

  const selectedRequest = activeList.find((request) => request.id === selectedId);

  const handleAnswerChange = (requestId, value) => {
    setAnswers((prev) => ({ ...prev, [requestId]: value }));
  };

  const handleSelect = (requestId) => {
    setSelectedId(requestId);
    setMobileDetailOpen(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileDetailOpen(false);
    setNoWhatsAppRequestId(null);
  };

  const finishAnsweringRequest = async (requestId) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[requestId];
      return next;
    });

    await loadRequests();

    setActiveTab(TAB.answered);
    setSelectedId(requestId);
    setMobileDetailOpen(true);
    window.focus();
  };

  const handleMarkAnsweredByPhone = async (request) => {
    const note = (answers[request.id] ?? "").trim();

    setSendingId(request.id);
    setError(null);
    setNoWhatsAppRequestId(null);

    try {
      await markRequestAsAnsweredByPhone(request.id, note);
      await finishAnsweringRequest(request.id);
    } catch (err) {
      console.error("Failed to mark request as answered by phone:", err);
      setError("סימון הפנייה כנענתה נכשל. נסי שוב.");
    } finally {
      setSendingId(null);
    }
  };

  const handleSend = async (request) => {
    const answer = (answers[request.id] ?? "").trim();
    if (!answer) return;

    if (!isWhatsAppCapablePhone(request.phone)) {
      setNoWhatsAppRequestId(request.id);
      setError(null);
      return;
    }

    const whatsappMessage = buildStaffWhatsAppMessage({
      answer,
      content: request.content,
      date: request.date,
    });

    setSendingId(request.id);
    setError(null);
    setNoWhatsAppRequestId(null);

    const whatsappResult = await openWhatsAppChat(
      request.phone,
      whatsappMessage,
    );

    if (!whatsappResult.ok) {
      setNoWhatsAppRequestId(request.id);
      setSendingId(null);
      return;
    }

    try {
      await markRequestAsAnswered(request.id, answer, { channel: "whatsapp" });
      await finishAnsweringRequest(request.id);
    } catch (err) {
      console.error("Failed to mark request as answered:", err);
      setError("שליחת התשובה נכשלה. נסי שוב.");
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="requests-inbox list-mgmt-page" dir="rtl">
        <div className="staff-container">
          <div className="requests-inbox__loading">טוען פניות...</div>
        </div>
      </div>
    );
  }

  const summaryCards = [
    { key: "total", label: "סך הפניות", value: requests.length, icon: Mail },
    { key: "waiting", label: "לא נענו", value: waiting.length, icon: Clock },
    {
      key: "answered",
      label: "נענו",
      value: answered.length,
      icon: CheckCircle2,
    },
    {
      key: "today",
      label: "פניות היום",
      value: todayCount,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="requests-inbox list-mgmt-page" dir="rtl">
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="list-mgmt-decoration list-mgmt-decoration--top"
      />
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="list-mgmt-decoration list-mgmt-decoration--left"
      />
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="list-mgmt-decoration list-mgmt-decoration--bottom"
      />

      <div className="staff-container">
        <header className="list-mgmt-page__header">
          <div className="list-mgmt-page__header-main">
            <h1 className="list-mgmt-page__title">ניהול פניות</h1>
            <p className="list-mgmt-page__subtitle">
              מענה לפניות הקהילה בוואטסאפ או בשיחה
            </p>
          </div>
          <div className="list-mgmt-page__actions">
            {onNavigate ? (
              <button
                type="button"
                className="staff-back-button"
                onClick={() => onNavigate("dashboard")}
              >
                <span className="staff-back-button__icon" aria-hidden="true">
                  →
                </span>
                חזרה ללוח הבקרה
              </button>
            ) : null}
          </div>
        </header>

        <div className="list-mgmt-summary" aria-label="סיכום פניות">
          {summaryCards.map(({ key, label, value, icon: Icon }) => (
            <div key={key} className="list-mgmt-summary__item">
              <span className="list-mgmt-summary__icon" aria-hidden="true">
                <Icon className="list-mgmt-summary__icon-glyph" strokeWidth={2} />
              </span>
              <span className="list-mgmt-summary__value">{value}</span>
              <span className="list-mgmt-summary__label">{label}</span>
            </div>
          ))}
        </div>

        {error && (
          <p className="requests-inbox__error" role="alert">
            {error}
          </p>
        )}

        <nav className="requests-inbox__nav" aria-label="סוג פניות">
          <button
            type="button"
            className={`requests-inbox__nav-btn ${
              activeTab === TAB.waiting ? "is-active" : ""
            }`}
            onClick={() => handleTabChange(TAB.waiting)}
          >
            לא נענו
            <span className="requests-inbox__nav-count">{waiting.length}</span>
          </button>
          <button
            type="button"
            className={`requests-inbox__nav-btn ${
              activeTab === TAB.answered ? "is-active" : ""
            }`}
            onClick={() => handleTabChange(TAB.answered)}
          >
            נענו
            <span className="requests-inbox__nav-count">{answered.length}</span>
          </button>
        </nav>

        <div
          className={[
            "requests-inbox__workspace",
            mobileDetailOpen ? "is-detail-open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <section className="requests-inbox__list-panel" aria-label="רשימת פניות">
            {activeList.length === 0 ? (
              <p className="requests-inbox__empty">
                {activeTab === TAB.waiting
                  ? "אין פניות ממתינות."
                  : "אין פניות שנענו עדיין."}
              </p>
            ) : (
              <ul className="inbox-list">
                {activeList.map((request) => (
                  <li key={request.id}>
                    <RequestListRow
                      phone={request.phone}
                      snippet={request.content}
                      date={
                        activeTab === TAB.waiting
                          ? formatDisplayDate(request.date)
                          : formatDisplayDate(request.answeredAt)
                      }
                      isSelected={selectedId === request.id}
                      isUnread={activeTab === TAB.waiting}
                      onClick={() => handleSelect(request.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            className="requests-inbox__detail-panel"
            aria-label="פרטי פנייה"
          >
            {selectedRequest ? (
              <RequestDetailPanel
                request={selectedRequest}
                mode={activeTab === TAB.waiting ? "waiting" : "answered"}
                answer={answers[selectedRequest.id] ?? ""}
                onAnswerChange={(value) =>
                  handleAnswerChange(selectedRequest.id, value)
                }
                onSend={() => handleSend(selectedRequest)}
                onMarkAnsweredByPhone={() =>
                  handleMarkAnsweredByPhone(selectedRequest)
                }
                isSending={sendingId === selectedRequest.id}
                showNoWhatsAppNotice={
                  noWhatsAppRequestId === selectedRequest.id
                }
                onReportNoWhatsApp={() => {
                  setNoWhatsAppRequestId(selectedRequest.id);
                  setError(null);
                }}
                onBack={() => setMobileDetailOpen(false)}
              />
            ) : activeList.length > 0 ? (
              <div className="requests-inbox__detail-empty">
                <p>בחרי פנייה מהרשימה כדי לקרוא ולהשיב</p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

export default RequestsPage;
