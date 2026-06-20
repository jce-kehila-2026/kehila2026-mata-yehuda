import CommunityStaffCheckboxGrid from "./CommunityStaffCheckboxGrid.jsx";

export function toggleArrayValue(values, value) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}

export function buildSubscriptionFormValues(source) {
  const monthlyPrice = source?.monthlyPrice;

  return {
    monthlyPrice:
      monthlyPrice === null || monthlyPrice === undefined
        ? ""
        : String(monthlyPrice),
    requestedServices: Array.isArray(source?.requestedServices)
      ? [...source.requestedServices]
      : [],
    languages: Array.isArray(source?.languages) ? [...source.languages] : [],
    otherService: source?.otherService || "",
  };
}

export function validateSubscriptionForm(form) {
  if (!Array.isArray(form.requestedServices) || form.requestedServices.length === 0) {
    return "נא לבחור לפחות סוג עזרה אחד";
  }

  if (
    form.requestedServices.includes("other") &&
    !form.otherService?.trim()
  ) {
    return "נא לתאר את סוג העזרה המבוקש";
  }

  if (!Array.isArray(form.languages) || form.languages.length === 0) {
    return "נא לבחור לפחות שפה אחת";
  }

  if (form.monthlyPrice !== "" && form.monthlyPrice !== null) {
    const price = parseFloat(form.monthlyPrice);

    if (Number.isNaN(price) || price < 0) {
      return "מחיר חודשי חייב להיות מספר תקין";
    }
  }

  return "";
}

function CommunityStaffSubscriptionFormFields({
  form,
  updateField,
  lookups,
  lookupsLoading,
  idPrefix,
}) {
  return (
    <>
      <div className="community-join-modal__field">
        <label htmlFor={`${idPrefix}-monthly-price`}>מחיר חודשי (₪)</label>
        <input
          id={`${idPrefix}-monthly-price`}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={form.monthlyPrice}
          onChange={(event) => updateField("monthlyPrice", event.target.value)}
        />
      </div>

      <div className="community-join-modal__field community-join-modal__field--full">
        <label>שירותים מבוקשים *</label>
        <CommunityStaffCheckboxGrid
          items={lookups.helpTypes}
          selectedValues={form.requestedServices}
          onToggle={(id) =>
            updateField(
              "requestedServices",
              toggleArrayValue(form.requestedServices, id)
            )
          }
          getItemId={(helpType) => helpType.id}
          getItemLabel={(helpType) => helpType.help_name}
          variant="help-types"
          loading={lookupsLoading}
          loadingText="טוען סוגי עזרה..."
        />
      </div>

      {form.requestedServices.includes("other") && (
        <div className="community-join-modal__field community-join-modal__field--full">
          <label htmlFor={`${idPrefix}-other-service`}>תיאור שירות אחר *</label>
          <textarea
            id={`${idPrefix}-other-service`}
            value={form.otherService}
            onChange={(event) =>
              updateField("otherService", event.target.value)
            }
          />
        </div>
      )}

      <div className="community-join-modal__field community-join-modal__field--full">
        <label>שפות *</label>
        <CommunityStaffCheckboxGrid
          items={lookups.languages}
          selectedValues={form.languages}
          onToggle={(id) =>
            updateField("languages", toggleArrayValue(form.languages, id))
          }
          getItemId={(language) => language.id}
          getItemLabel={(language) => language.name}
          variant="languages"
          loading={lookupsLoading}
          loadingText="טוען שפות..."
        />
      </div>
    </>
  );
}

export default CommunityStaffSubscriptionFormFields;
