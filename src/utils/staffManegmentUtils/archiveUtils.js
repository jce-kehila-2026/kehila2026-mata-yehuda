export const ARCHIVE_CONFIRM_MESSAGE =
    "האם את בטוחה שברצונך להעביר לארכיון?";

export const PERMANENT_DELETE_CONFIRM_MESSAGE =
    "האם את בטוחה שברצונך למחוק לצמיתות? פעולה זו אינה ניתנת לשחזור.";

export function getRecordData(record) {
    if (!record) {
        return {};
    }

    return record.data !== undefined ? record.data : record;
}

export function isRecordArchived(record) {
    return getRecordData(record).isArchived === true;
}

export function isRecordActive(record) {
    return !isRecordArchived(record);
}

export function filterActiveRecords(records) {
    return records.filter(isRecordActive);
}

export function filterArchivedRecords(records) {
    return records.filter(isRecordArchived);
}
