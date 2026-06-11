import { useEffect, useState } from "react";
import { getActiveHelpTypes } from "../../services/supportive community/supportiveCommunityService";

function HelpServicesSelector({
  selectedServices = [],
  setSelectedServices,
}) {
  const [helpServices, setHelpServices] = useState([]);

  useEffect(() => {
    const loadHelpTypes = async () => {
      try {
        const data = await getActiveHelpTypes();
        setHelpServices(data);
      } catch (error) {
        console.error("Error loading help types:", error);
      }
    };

    loadHelpTypes();
  }, []);

  const handleChange = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(
        selectedServices.filter((id) => id !== serviceId)
      );
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  return (
    <div className="form-selector">
      <h3>בחר סוגי עזרה</h3>
      <p className="form-hint">ניתן לבחור יותר מאפשרות אחת</p>

      <div className="options-container">
        {helpServices.map((service) => (
          <label key={service.id} className="option-label">
            <input
              type="checkbox"
              checked={selectedServices.includes(service.id)}
              onChange={() => handleChange(service.id)}
            />

            {service.help_name}
          </label>
        ))}
      </div>
    </div>
  );
}

export default HelpServicesSelector;
