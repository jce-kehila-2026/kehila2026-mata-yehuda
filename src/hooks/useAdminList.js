import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ADMIN_PAGE_SIZE_ALL,
    DEFAULT_ADMIN_PAGE_SIZE,
    isShowAllPageSize,
    paginateItems,
    sortItems,
    toggleSortDirection
} from "../utils/adminListUtils";

export function useAdminList({
    sourceItems = [],
    filterItems,
    totalCount,
    getSortValue,
    initialSortField = "name",
    initialSortDirection = "asc",
    initialPageSize = DEFAULT_ADMIN_PAGE_SIZE
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});
    const [sortField, setSortField] = useState(initialSortField);
    const [sortDirection, setSortDirection] = useState(initialSortDirection);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const filteredItems = useMemo(() => {
        if (typeof filterItems === "function") {
            return filterItems(sourceItems, searchQuery, filters);
        }

        return sourceItems;
    }, [sourceItems, filterItems, searchQuery, filters]);

    const resolvedTotalCount = totalCount ?? sourceItems.length;

    const sortedItems = useMemo(
        () => sortItems(filteredItems, getSortValue, sortField, sortDirection),
        [filteredItems, getSortValue, sortField, sortDirection]
    );

    const pagination = useMemo(
        () => paginateItems(sortedItems, page, pageSize),
        [sortedItems, page, pageSize]
    );

    const setFilter = useCallback((key, value) => {
        setFilters((previous) => ({ ...previous, [key]: value }));
        setPage(1);
    }, []);

    const handleSearchChange = useCallback((value) => {
        setSearchQuery(value);
        setPage(1);
    }, []);

    const handlePageSizeChange = useCallback((nextPageSize) => {
        setPageSize(
            isShowAllPageSize(nextPageSize)
                ? ADMIN_PAGE_SIZE_ALL
                : Number(nextPageSize)
        );
        setPage(1);
    }, []);

    const handleSort = useCallback((field) => {
        setSortField(field);
        setSortDirection((previousDirection) =>
            toggleSortDirection(sortField, previousDirection, field)
        );
        setPage(1);
    }, [sortField]);

    useEffect(() => {
        if (page > pagination.totalPages) {
            setPage(pagination.totalPages);
        }
    }, [page, pagination.totalPages]);

    return {
        searchQuery,
        setSearchQuery: handleSearchChange,
        filters,
        setFilter,
        sortField,
        sortDirection,
        handleSort,
        page: pagination.page,
        setPage,
        pageSize,
        setPageSize: handlePageSizeChange,
        pageItems: pagination.items,
        totalPages: pagination.totalPages,
        totalFiltered: pagination.totalFiltered,
        totalCount: resolvedTotalCount,
        startIndex: pagination.startIndex,
        endIndex: pagination.endIndex,
        pageCount: pagination.items.length,
        showAll: pagination.showAll
    };
}
