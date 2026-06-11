/**
 * Central navigation config for staff inquiries (פניות).
 * Update STAFF_INQUIRIES_ROUTE when a dedicated management page is ready.
 */
export const STAFF_INQUIRIES_ROUTE = "inquiries";
export const STAFF_INQUIRY_ID_KEY = "inquiryId";

export function getStaffInquiriesRoute() {
    return STAFF_INQUIRIES_ROUTE;
}

export function buildInquiryNavigationState(inquiryId = null) {
    if (!inquiryId) {
        return {};
    }

    return {
        [STAFF_INQUIRY_ID_KEY]: inquiryId
    };
}
