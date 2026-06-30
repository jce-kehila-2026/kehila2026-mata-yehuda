import { useId, useState } from "react";

const MIN_CHARS_FOR_TOGGLE = 72;

function ExpandableDescription({
  text,
  textClassName = "",
  toggleClassName = "expandable-description__toggle",
}) {
  const [expanded, setExpanded] = useState(false);
  const descriptionId = useId();
  const description = text?.trim();

  if (!description) {
    return null;
  }

  const showToggle = description.length > MIN_CHARS_FOR_TOGGLE;
  const textClasses = [
    "expandable-description__text",
    textClassName,
    showToggle && !expanded ? "expandable-description__text--collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="expandable-description">
      <p id={descriptionId} className={textClasses}>
        {description}
      </p>
      {showToggle ? (
        <button
          type="button"
          className={toggleClassName}
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-controls={descriptionId}
        >
          {expanded ? "הצג פחות" : "הצג עוד"}
        </button>
      ) : null}
    </div>
  );
}

export default ExpandableDescription;
