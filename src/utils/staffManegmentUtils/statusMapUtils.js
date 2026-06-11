export function normalizeStatusKey(status) {
    if (status == null) {
        return "";
    }

    if (typeof status === "string") {
        return status.trim();
    }

    return String(status).trim();
}

export function lookupStatusEntry(status, map) {
    const key = normalizeStatusKey(status);

    if (!key || !map) {
        return null;
    }

    if (map[key]) {
        return map[key];
    }

    const lowerKey = key.toLowerCase();

    for (const [mapKey, entry] of Object.entries(map)) {
        if (mapKey.toLowerCase() === lowerKey) {
            return entry;
        }
    }

    return null;
}
