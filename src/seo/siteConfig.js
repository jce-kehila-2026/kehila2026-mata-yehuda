export const SITE_URL = "https://matayehuda-frontend.onrender.com";

export const SITE_NAME = "ותיקי מטה יהודה";

export const DEFAULT_DESCRIPTION =
  "עמותת ותיקי מטה יהודה — קהילה תומכת, מרכז יום, פעילויות, התנדבות ותרומות לוותיקים במועצה האזורית מטה יהודה.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-section.png`;

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "NGO"],
  name: "עמותת ותיקי מטה יהודה",
  alternateName: ["ותיקי מטה יהודה", "מרכז יום לוותיק מטה יהודה"],
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.png`,
  image: DEFAULT_OG_IMAGE,
  telephone: "+972-2-995-8649",
  address: {
    "@type": "PostalAddress",
    streetAddress: "מרכז אזורי הר טוב",
    addressLocality: "אבן העזר",
    addressRegion: "מועצה אזורית מטה יהודה",
    addressCountry: "IL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 31.764074,
    longitude: 34.999016,
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: "מועצה אזורית מטה יהודה",
  },
  description: DEFAULT_DESCRIPTION,
};
