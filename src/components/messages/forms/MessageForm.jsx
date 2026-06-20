import { Loader2, Send } from "lucide-react";
import { NOTIFICATION_TARGET_GROUPS } from "../helpers/messageHelpers";

function MessageForm({
    title,
    body,
    targetGroup,
    complianceNote,
    sending,
    onTitleChange,
    onBodyChange,
    onTargetGroupChange,
    onSubmit
}) {
    const showGroupGrid = NOTIFICATION_TARGET_GROUPS.length > 1;

    return (
        <form
            className="notifications-form"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit?.();
            }}
        >
            <div className="notifications-form__header">
                <h2 className="notifications-form__title">שליחת התראה חדשה</h2>
                {complianceNote ? (
                    <p className="notifications-form__note">{complianceNote}</p>
                ) : null}
            </div>

            <div className="notifications-form__fields-row">
                <div className="notifications-form__field">
                    <label htmlFor="notification-title">כותרת התראה</label>
                    <input
                        id="notification-title"
                        type="text"
                        className="notifications-form__input"
                        placeholder="לדוגמה: מטה יהודה"
                        value={title}
                        onChange={(event) => onTitleChange(event.target.value)}
                        disabled={sending}
                        autoComplete="off"
                    />
                </div>

                <div className="notifications-form__field notifications-form__field--body">
                    <label htmlFor="notification-body">תוכן ההתראה</label>
                    <textarea
                        id="notification-body"
                        className="notifications-form__textarea"
                        placeholder="כתבו כאן את תוכן ההודעה שתופיע במכשירי המשתתפים..."
                        value={body}
                        onChange={(event) => onBodyChange(event.target.value)}
                        disabled={sending}
                        rows={5}
                    />
                </div>
            </div>

            <div className="notifications-form__field notifications-form__field--audience">
                <span className="notifications-form__label" id="notification-target-group-label">
                    קבוצת יעד
                </span>
                {showGroupGrid ? (
                    <div
                        className="notifications-form__audience-grid"
                        role="radiogroup"
                        aria-labelledby="notification-target-group-label"
                    >
                        {NOTIFICATION_TARGET_GROUPS.map((group) => {
                            const isSelected = targetGroup === group.value;

                            return (
                                <label
                                    key={group.value}
                                    className={
                                        isSelected
                                            ? "notifications-form__audience-chip notifications-form__audience-chip--selected"
                                            : "notifications-form__audience-chip"
                                    }
                                >
                                    <input
                                        type="radio"
                                        name="notification-target-group"
                                        value={group.value}
                                        checked={isSelected}
                                        onChange={(event) =>
                                            onTargetGroupChange(event.target.value)
                                        }
                                        disabled={sending}
                                    />
                                    <span>{group.label}</span>
                                </label>
                            );
                        })}
                    </div>
                ) : (
                    <select
                        id="notification-target-group"
                        className="notifications-form__select"
                        value={targetGroup}
                        onChange={(event) =>
                            onTargetGroupChange(event.target.value)
                        }
                        disabled={sending}
                        aria-labelledby="notification-target-group-label"
                    >
                        {NOTIFICATION_TARGET_GROUPS.map((group) => (
                            <option key={group.value} value={group.value}>
                                {group.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="notifications-form__actions">
                <button
                    type="submit"
                    className="staff-button notifications-form__submit"
                    disabled={sending}
                    aria-busy={sending}
                >
                    {sending ? (
                        <>
                            <Loader2
                                className="notifications-form__submit-spinner"
                                strokeWidth={2.25}
                                aria-hidden="true"
                            />
                            <span>שולח התראה...</span>
                        </>
                    ) : (
                        <>
                            <Send
                                className="notifications-form__submit-icon"
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                            <span>שליחת התראה</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

export default MessageForm;
