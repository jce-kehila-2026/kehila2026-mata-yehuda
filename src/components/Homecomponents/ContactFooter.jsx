import { useState } from "react";
import {
  ORGANIZATION_LOCATION,
} from "../../config/organizationLocation";
import LocationMapModal from "./LocationMapModal";

const CONTACT_PHONE = "041234567";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="home-contact-footer__icon">
      <path
        d="M6.6 10.8a15.9 15.9 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.1 21 3 13.9 3 5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
        fill="currentColor"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="home-contact-footer__icon">
      <path
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
        fill="currentColor"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="home-contact-footer__icon">
      <path
        d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function ContactFooter() {
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      <footer id="contact" className="home-contact-footer">
        <div className="home-contact-footer__wave" aria-hidden="true">
          <svg viewBox="0 0 1440 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,56 L0,34 C120,18 240,42 360,28 C480,14 600,40 720,26 C840,12 960,38 1080,24 C1200,10 1320,36 1440,22 L1440,56 Z" />
          </svg>
        </div>

        <div className="home-contact-footer__main">
          <h2 className="home-contact-footer__title">רוצים לשמוע עוד?</h2>
          <div className="home-contact-footer__title-divider" aria-hidden="true">
            <span className="home-contact-footer__title-line" />
            <span className="home-contact-footer__title-heart">♡</span>
            <span className="home-contact-footer__title-line" />
          </div>
          <p className="home-contact-footer__subtitle">
            צוות שלנו זמין לענות על כל שאלה ולתאם ביקור היכרות ללא התחייבות.
          </p>

          <a
            href={`tel:${CONTACT_PHONE}`}
            className="home-contact-footer__cta"
          >
            <span>צרו קשר</span>
            <PhoneIcon />
          </a>

          <div className="home-contact-footer__items">
            <button
              type="button"
              className="home-contact-footer__item home-contact-footer__item--button"
              onClick={() => setShowMap(true)}
            >
              <span className="home-contact-footer__icon-wrap">
                <LocationIcon />
              </span>
              <span>
                {ORGANIZATION_LOCATION.street}, {ORGANIZATION_LOCATION.locality}
              </span>
            </button>

            <span className="home-contact-footer__divider" aria-hidden="true" />

            <a href="mailto:info@shalva.org.il" className="home-contact-footer__item">
              <span className="home-contact-footer__icon-wrap">
                <MailIcon />
              </span>
              <span>info@shalva.org.il</span>
            </a>
          </div>
        </div>

        <div className="home-contact-footer__bottom">
          <p>הבית החם של ותיקי מטה יהודה | כל הזכויות שמורות 2026</p>
        </div>
      </footer>

      {showMap && <LocationMapModal onClose={() => setShowMap(false)} />}
    </>
  );
}

export default ContactFooter;
