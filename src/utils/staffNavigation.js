export const STAFF_PAGE_STATE_KEY = "staffPage";

export function parseStaffPage(state) {
    if (state && typeof state[STAFF_PAGE_STATE_KEY] === "string") {
        return state[STAFF_PAGE_STATE_KEY];
    }
    return "dashboard";
}

export function getStaffPageFromPopStateEvent(event) {
    return parseStaffPage(event?.state);
}

export function getStaffSection(page) {
    if (!page || page === "dashboard") {
        return "dashboard";
    }

    const slashIndex = page.indexOf("/");
    return slashIndex === -1 ? page : page.slice(0, slashIndex);
}

export function getStaffView(page, defaultView = "menu") {
    if (!page || page === "dashboard") {
        return defaultView;
    }

    const slashIndex = page.indexOf("/");
    if (slashIndex === -1) {
        return defaultView;
    }

    return page.slice(slashIndex + 1) || defaultView;
}

export function buildStaffPage(section, view) {
    if (!view || view === "menu") {
        return section;
    }

    return `${section}/${view}`;
}

export function pushStaffPage(page, extraState = {}) {
    window.history.pushState(
        { [STAFF_PAGE_STATE_KEY]: page, ...extraState },
        ""
    );
}

export function replaceStaffPage(page, extraState = {}) {
    window.history.replaceState(
        { [STAFF_PAGE_STATE_KEY]: page, ...extraState },
        ""
    );
}

export function staffNavigateBack() {
    window.history.back();
}

/**
 * Pop history to dashboard in one gesture (matches stacked pushState entries).
 */
export function staffNavigateToDashboard(stepsBack) {
    if (stepsBack > 0) {
        window.history.go(-stepsBack);
        return;
    }

    replaceStaffPage("dashboard");
}

export function createStaffNavStack(initialPage = "dashboard") {
    return [initialPage];
}

export function applyStaffPopState(stack, page) {
    if (page === "dashboard") {
        return ["dashboard"];
    }

    if (stack.length > 1) {
        const next = [...stack];
        next.pop();

        if (next[next.length - 1] === page) {
            return next;
        }
    }

    const pageIndex = stack.indexOf(page);
    if (pageIndex >= 0) {
        return stack.slice(0, pageIndex + 1);
    }

    return ["dashboard", page];
}

export function pushStaffNavStack(stack, page) {
    if (stack[stack.length - 1] === page) {
        return stack;
    }

    return [...stack, page];
}

export function getStepsBackToDashboard(stack) {
    return Math.max(0, stack.length - 1);
}
