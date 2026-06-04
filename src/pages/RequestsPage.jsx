import { useEffect, useMemo, useState } from "react";

import AnsweredRequests from "../components/AnsweredRequests";
import RequestCard from "../components/RequestCard";
import {
  getAllRequests,
  markRequestAsAnswered,
} from "../services/requestsService";
import "../styles/requests.css";
import {
  buildWhatsAppUrl,
  isWhatsAppCapablePhone,
  sortAnsweredRequests,
  sortWaitingRequests,
} from "../utils/formatters";

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
  const [expandedAnsweredId, setExpandedAnsweredId] = useState(null);
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

  const handleAnswerChange = (requestId, value) => {
    setAnswers((prev) => ({ ...prev, [requestId]: value }));
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
      setExpandedAnsweredId(request.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      <div className="supportive-community-page">
        <header className="community-hero">
          <span className="hero-icon" aria-hidden>
            💬
          </span>
          <h1>ניהול פניות</h1>
        </header>
        <p className="community-section requests-status">טוען פניות...</p>
      </div>
    );
  }

  return (
    <div className="supportive-community-page">
      <header className="community-hero">
        <span className="hero-icon" aria-hidden>
          💬
        </span>
        <h1>ניהול פניות</h1>
        <p>מענה לפניות הקהילה — שליחה בוואטסאפ ומעקב אחרי פניות שנענו</p>
      </header>

      <div className="requests-toolbar">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => loadRequests({ showLoading: true })}
        >
          רענון
        </button>
      </div>

      <nav className="requests-tabs-wrap" aria-label="סוג פניות">
        <div className="requests-tabs">
          <button
            type="button"
            className={`requests-tabs__btn ${
              activeTab === TAB.waiting ? "is-active" : ""
            }`}
            onClick={() => {
              setActiveTab(TAB.waiting);
              setExpandedAnsweredId(null);
            }}
          >
            לא נענו
            <span className="requests-tabs__count">{waiting.length}</span>
          </button>
          <button
            type="button"
            className={`requests-tabs__btn ${
              activeTab === TAB.answered ? "is-active" : ""
            }`}
            onClick={() => {
              setActiveTab(TAB.answered);
              setExpandedAnsweredId(null);
            }}
          >
            נענו
            <span className="requests-tabs__count">{answered.length}</span>
          </button>
        </div>
      </nav>

      {error && (
        <p className="requests-error" role="alert">
          {error}
        </p>
      )}

      <div className="requests-panel">
        {activeTab === TAB.waiting && (
          <section className="community-section" aria-label="פניות שלא נענו">
            <h2>פניות שלא נענו</h2>

            {waiting.length === 0 ? (
              <p className="requests-empty section-description">
                אין פניות ממתינות.
              </p>
            ) : (
              <div className="services-grid services-grid--single">
                {waiting.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    answer={answers[request.id] ?? ""}
                    onAnswerChange={(value) =>
                      handleAnswerChange(request.id, value)
                    }
                    onSend={() => handleSend(request)}
                    isSending={sendingId === request.id}
                    showNoWhatsAppNotice={
                      noWhatsAppRequestId === request.id
                    }
                    onReportNoWhatsApp={() => {
                      setNoWhatsAppRequestId(request.id);
                      setError(null);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === TAB.answered && (
          <section className="community-section" aria-label="פניות שנענו">
            <h2>פניות שנענו</h2>
            <AnsweredRequests
              requests={answered}
              expandedId={expandedAnsweredId}
              onExpandedChange={setExpandedAnsweredId}
            />
          </section>
        )}
      </div>
    </div>
  );
}

export default RequestsPage;
