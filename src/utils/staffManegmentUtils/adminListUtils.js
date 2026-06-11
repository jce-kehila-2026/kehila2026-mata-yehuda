export const ADMIN_PAGE_SIZE_ALL = "all";

export const ADMIN_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const DEFAULT_ADMIN_PAGE_SIZE = 10;

export function isShowAllPageSize(pageSize) {
    return pageSize === ADMIN_PAGE_SIZE_ALL;
}

export function normalizeSearchQuery(value) {
    return String(value ?? "").trim().toLowerCase();
}

export function paginateItems(items, page, pageSize) {
    const totalFiltered = items.length;

    if (isShowAllPageSize(pageSize)) {
        return {
            items,
            page: 1,
            pageSize: ADMIN_PAGE_SIZE_ALL,
            totalPages: 1,
            totalFiltered,
            startIndex: totalFiltered === 0 ? 0 : 1,
            endIndex: totalFiltered,
            showAll: true
        };
    }

    const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_ADMIN_PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(totalFiltered / safePageSize) || 1);
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * safePageSize;

    return {
        items: items.slice(start, start + safePageSize),
        page: safePage,
        pageSize: safePageSize,
        totalPages,
        totalFiltered,
        startIndex: totalFiltered === 0 ? 0 : start + 1,
        endIndex: Math.min(start + safePageSize, totalFiltered),
        showAll: false
    };
}

export function compareAdminValues(left, right, direction = "asc") {
    const leftEmpty = left === null || left === undefined || left === "";
    const rightEmpty = right === null || right === undefined || right === "";

    if (leftEmpty && rightEmpty) {
        return 0;
    }

    if (leftEmpty) {
        return 1;
    }

    if (rightEmpty) {
        return -1;
    }

    if (typeof left === "boolean" && typeof right === "boolean") {
        const result = Number(left) - Number(right);
        return direction === "desc" ? -result : result;
    }

    if (typeof left === "number" && typeof right === "number") {
        const result = left - right;
        return direction === "desc" ? -result : result;
    }

    const leftDate =
        left?.toDate?.() ??
        (left?.seconds ? new Date(left.seconds * 1000) : null);
    const rightDate =
        right?.toDate?.() ??
        (right?.seconds ? new Date(right.seconds * 1000) : null);

    if (leftDate instanceof Date && !Number.isNaN(leftDate.getTime()) &&
        rightDate instanceof Date && !Number.isNaN(rightDate.getTime())) {
        const result = leftDate.getTime() - rightDate.getTime();
        return direction === "desc" ? -result : result;
    }

    const result = String(left).localeCompare(String(right), "he", {
        numeric: true,
        sensitivity: "base"
    });

    return direction === "desc" ? -result : result;
}

export function sortItems(items, getSortValue, sortField, sortDirection) {
    if (!sortField) {
        return [...items];
    }

    return [...items].sort((leftItem, rightItem) =>
        compareAdminValues(
            getSortValue(leftItem, sortField),
            getSortValue(rightItem, sortField),
            sortDirection
        )
    );
}

export function toggleSortDirection(currentField, currentDirection, nextField) {
    if (currentField !== nextField) {
        return "asc";
    }

    return currentDirection === "asc" ? "desc" : "asc";
}
