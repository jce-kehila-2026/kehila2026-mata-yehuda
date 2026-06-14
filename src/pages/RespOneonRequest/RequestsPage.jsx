import { useEffect, useMemo, useState } from "react";

import RequestDetailPanel from "../../components/RespOneonRequest/RequestDetailPanel";
import RequestListRow from "../../components/RespOneonRequest/RequestListRow";
import {
  getAllRequests,
  markRequestAsAnswered,
} from "../../services/RespOneonRequest/requestsService";
import "../../styles/RespOneonRequest/requests.css";
import {
  buildWhatsAppUrl,
  formatDisplayDate,
  isWhatsAppCapablePhone,
  sortAnsweredRequests,
  sortWaitingRequests,
} from "../../utils/RespOneonRequest/formatters";

const TAB = {
  waiting: "waiting",
  answered: "answered",
};

function RequestsPage() {
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

  const handleSend = async (request) => {
    const answer = (answers[request.id] ?? "").trim();
    if (!answer) return;

    if (!isWhatsAppCapablePhone(request.phone)) {
      setNoWhatsAppRequestId(request.id);
      setError(null);
      return;
    }

    const whatsappUrl = buildWhatsAppUrl(request.phone, answer);
    if (!whatsappUrl) {
      setNoWhatsAppRequestId(request.id);
      setError(null);
      return;
    }

    setSendingId(request.id);
    setError(null);
    setNoWhatsAppRequestId(null);

    const whatsappWindow = window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer",
    );

    if (whatsappWindow) {
      whatsappWindow.opener = null;
    }

    try {
      await markRequestAsAnswered(request.id, answer);

      setAnswers((prev) => {
        const next = { ...prev };
        delete next[request.id];
        return next;
      });

      await loadRequests();

      setActiveTab(TAB.answered);
      setSelectedId(request.id);
      setMobileDetailOpen(true);
      window.focus();
    } catch (err) {
      console.error("Failed to mark request as answered:", err);
      setError("שליחת התשובה נכשלה. נסי שוב.");
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="requests-inbox">
        <div className="requests-inbox__loading">טוען פניות...</div>
      </div>
    );
  }

  return (
    <div className="requests-inbox">
      <header className="requests-inbox__page-header">
        <div>
          <h1 className="requests-inbox__page-title">ניהול פניות</h1>
          <p className="requests-inbox__page-subtitle">
            מענה לפניות הקהילה בוואטסאפ או בשיחה
          </p>
        </div>
        <button
          type="button"
          className="inbox-btn inbox-btn--ghost"
          onClick={() => loadRequests({ showLoading: true })}
        >
          רענון
        </button>
      </header>

      {error && (
        <p className="requests-inbox__error" role="alert">
          {error}
        </p>
      )}

      <div className="requests-inbox__shell">
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
            ) : (
              <div className="requests-inbox__detail-empty">
                <p>בחרי פנייה מהרשימה כדי לקרוא ולהשיב</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default RequestsPage;
