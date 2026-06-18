import {
  ORGANIZATION_LOCATION,
  buildGoogleMapsEmbedUrl,
  buildGoogleMapsSearchUrl,
  buildWazeNavigationUrl,
} from "../../config/organizationLocation";

function LocationMapModal({ onClose }) {
  const mapEmbedUrl = buildGoogleMapsEmbedUrl();
  const googleMapsUrl = buildGoogleMapsSearchUrl();
  const wazeUrl = buildWazeNavigationUrl();

  return (
    <div
      className="location-map-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-map-modal-title"
      onClick={onClose}
    >
      <div
        className="location-map-modal__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="location-map-modal__close"
          aria-label="סגור מפה"
          onClick={onClose}
        >
          ×
        </button>

        <h2 id="location-map-modal-title" className="location-map-modal__title">
          איפה אנחנו נמצאים
        </h2>

        <p className="location-map-modal__address">
          <strong>{ORGANIZATION_LOCATION.name}</strong>
          <br />
          {ORGANIZATION_LOCATION.street}
          <br />
          {ORGANIZATION_LOCATION.locality}
          <br />
          {ORGANIZATION_LOCATION.region}
        </p>

        <div className="location-map-modal__frame-wrap">
          <iframe
            title="מפת מיקום מרכז יום לוותיק מטה יהודה"
            src={mapEmbedUrl}
            className="location-map-modal__frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="location-map-modal__actions">
          <a
            href={googleMapsUrl}
            className="location-map-modal__action"
            target="_blank"
            rel="noopener noreferrer"
          >
            פתיחה ב-Google Maps
          </a>
          <a
            href={wazeUrl}
            className="location-map-modal__action location-map-modal__action--waze"
            target="_blank"
            rel="noopener noreferrer"
          >
            ניווט ב-Waze
          </a>
        </div>
      </div>
    </div>
  );
}

export default LocationMapModal;
