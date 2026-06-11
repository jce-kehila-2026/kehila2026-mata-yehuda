import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { formatIsraeliDate, toActivityDate } from "../../utils/dateUtils";

const inquiriesCollection = collection(db, "inquiries");

const CLOSED_INQUIRY_STATUSES = new Set([
    "closed",
    "resolved",
    "handled",
    "completed",
    "done",
    "archived",
    "סגור",
    "הושלם",
    "טופל",
    "נסגר"
]);

function getInquiryTimestampMillis(inquiry) {
    const value =
        inquiry?.createdAt ??
        inquiry?.created_at ??
        inquiry?.submitted_at ??
        inquiry?.updated_at ??
        null;

    if (!value) {
        return 0;
    }

    const date = toActivityDate(value);

    return date ? date.getTime() : 0;
}

function normalizeInquiry(inquiryDoc) {
    const data = inquiryDoc.data() || {};

    return {
        id: inquiryDoc.id,
        senderName:
            data.sender_name ||
            data.senderName ||
            data.full_name ||
            data.name ||
            "",
        subject: data.subject || data.title || "",
        createdAt: data.created_at || data.submitted_at || data.createdAt || null,
        status: data.status ?? "new",
        raw: data
    };
}

export function isOpenInquiry(inquiry) {
    if (!inquiry) {
        return false;
    }

    const status = String(inquiry.status ?? "")
        .trim()
        .toLowerCase();

    if (!status) {
        return true;
    }

    return !CLOSED_INQUIRY_STATUSES.has(status);
}

export function formatInquiryDate(value) {
    const date = toActivityDate(value);

    if (!date) {
        return "";
    }

    return formatIsraeliDate(date);
}

export async function fetchOpenInquiries() {
    try {
        const snapshot = await getDocs(inquiriesCollection);

        return snapshot.docs
            .map(normalizeInquiry)
            .filter(isOpenInquiry)
            .sort(
                (left, right) =>
                    getInquiryTimestampMillis(right) - getInquiryTimestampMillis(left)
            );
    } catch (error) {
        console.error("Failed to load inquiries:", error);
        return [];
    }
}
