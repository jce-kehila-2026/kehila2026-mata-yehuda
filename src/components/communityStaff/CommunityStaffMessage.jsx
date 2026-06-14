import { useCallback, useEffect, useState } from "react";

const AUTO_DISMISS_MS = 4000;

export function useCommunityStaffMessage() {
  const [message, setMessage] = useState(null);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
  }, []);

  const showSuccess = useCallback(
    (text) => showMessage("success", text),
    [showMessage]
  );

  const showError = useCallback(
    (text) => showMessage("error", text),
    [showMessage]
  );

  const showInfo = useCallback((text) => showMessage("info", text), [showMessage]);

  const showWarning = useCallback(
    (text) => showMessage("warning", text),
    [showMessage]
  );

  return {
    message,
    showMessage,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearMessage,
  };
}

function CommunityStaffMessage({ message, onDismiss, className = "" }) {
  useEffect(() => {
    if (!message?.text) {
      return undefined;
    }

    const timer = setTimeout(() => {
      onDismiss?.();
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message?.text) {
    return null;
  }

  return (
    <div
      className={`community-staff-message community-staff-message--${message.type} ${className}`.trim()}
      role={message.type === "error" ? "alert" : "status"}
    >
      {message.text}
    </div>
  );
}

export default CommunityStaffMessage;
