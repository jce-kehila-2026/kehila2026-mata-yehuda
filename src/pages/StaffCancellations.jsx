import { useState } from "react";

const API_BASE = "http://localhost:5001";
const STAFF_PIN_KEY = "staffPin";

function StaffCancellations() {
  const [pin, setPin] = useState(() => sessionStorage.getItem(STAFF_PIN_KEY) || "");
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const loadCancellations = async (pinToUse) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/staff/cancellations`, {
        headers: {
          "x-staff-pin": pinToUse,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "שגיאה בטעינה");
        setCancellations([]);
        return;
      }

      sessionStorage.setItem(STAFF_PIN_KEY, pinToUse);
      setCancellations(data.cancellations || []);
      setLoaded(true);
    } catch (err) {
      console.error(err);
      setError("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadCancellations(pin.trim());
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("he-IL");
  };

  return (
    <div className="staff-page">
      <h1>ביטולי הרשמה – צוות</h1>
      <p>רשימת מי שביטל, סכום התשלום ואמצעי התשלום (מ-Firestore collection: cancellations)</p>

      <form className="staff-login" onSubmit={handleSubmit}>
        <label>
          קוד גישה לצוות:
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="הזן קוד"
          />
        </label>
        <button type="submit" disabled={loading || !pin.trim()}>
          {loading ? "טוען..." : "הצג ביטולים"}
        </button>
      </form>

      {error && <p className="staff-error">{error}</p>}

      {loaded && (
        <p className="staff-count">סה״כ ביטולים: {cancellations.length}</p>
      )}

      {cancellations.length > 0 && (
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>תאריך ביטול</th>
                <th>שם</th>
                <th>טלפון</th>
                <th>סכום</th>
                <th>איך שילם</th>
                <th>סטטוס תשלום</th>
                <th>החזר</th>
              </tr>
            </thead>
            <tbody>
              {cancellations.map((row) => (
                <tr key={row.id}>
                  <td>{formatDate(row.cancelledAt)}</td>
                  <td>{row.fullName || `${row.firstName || ""} ${row.lastName || ""}`.trim()}</td>
                  <td>{row.phone || "—"}</td>
                  <td>
                    {row.amount != null ? `$${row.amount}` : "—"}
                  </td>
                  <td>{row.paymentMethodLabel || row.paymentMethod || "—"}</td>
                  <td>{row.paymentStatus || "—"}</td>
                  <td>{row.refundNoteForStaff || row.refundStatus || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loaded && cancellations.length === 0 && !error && (
        <p>אין ביטולים עדיין.</p>
      )}
    </div>
  );
}

export default StaffCancellations;
