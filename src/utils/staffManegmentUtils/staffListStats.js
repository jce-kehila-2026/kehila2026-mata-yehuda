export function computeStaffListStats(staffList = []) {
    const stats = {
        total: staffList.length,
        active: 0,
        inactive: 0
    };

    staffList.forEach((staff) => {
        if (staff.is_active) {
            stats.active += 1;
        } else {
            stats.inactive += 1;
        }
    });

    return stats;
}

export function buildStaffSummaryItems(stats) {
    if (!stats) {
        return [];
    }

    return [
        { key: "total", label: "סה״כ אנשי צוות", value: stats.total },
        { key: "active", label: "פעילים", value: stats.active },
        { key: "inactive", label: "לא פעילים", value: stats.inactive }
    ];
}
