function CommunityStaffCheckboxGrid({
  items,
  selectedValues,
  onToggle,
  getItemId,
  getItemLabel,
  variant = "help-types",
  loading = false,
  loadingText = "טוען...",
}) {
  if (loading) {
    return (
      <p className="community-staff-checkbox-grid__loading" role="status">
        {loadingText}
      </p>
    );
  }

  return (
    <div
      className={`community-staff-checkbox-grid community-staff-checkbox-grid--${variant}`}
      role="group"
    >
      {items.map((item) => {
        const id = getItemId(item);
        const label = getItemLabel(item);
        const checked = selectedValues.includes(id);

        return (
          <label
            key={id}
            className={`community-staff-checkbox-grid__option${
              checked ? " community-staff-checkbox-grid__option--selected" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(id)}
            />
            <span className="community-staff-checkbox-grid__label">{label}</span>
          </label>
        );
      })}
    </div>
  );
}

export default CommunityStaffCheckboxGrid;
