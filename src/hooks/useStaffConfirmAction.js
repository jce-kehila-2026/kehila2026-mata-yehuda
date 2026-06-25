import { useState } from "react";

export function useStaffConfirmAction() {
    const [pendingAction, setPendingAction] = useState(null);
    const [processing, setProcessing] = useState(false);

    function requestAction({ message, confirmLabel = "אישור", action }) {
        setPendingAction({ message, confirmLabel, action });
    }

    function cancel() {
        if (!processing) {
            setPendingAction(null);
        }
    }

    async function confirm() {
        if (!pendingAction) {
            return;
        }

        setProcessing(true);

        try {
            await pendingAction.action();
        } finally {
            setProcessing(false);
            setPendingAction(null);
        }
    }

    return {
        pendingAction,
        processing,
        requestAction,
        cancel,
        confirm
    };
}
