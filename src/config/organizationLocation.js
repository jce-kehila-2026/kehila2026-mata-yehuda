export const ORGANIZATION_LOCATION = {
  name: "מרכז יום לוותיק – עמותת ותיקי מטה יהודה",
  street: "מרכז אזורי הר טוב",
  locality: "ד.נ. שמשון, אבן העזר",
  region: "מועצה אזורית מטה יהודה",
  latitude: 31.764074,
  longitude: 34.999016,
};

export function buildGoogleMapsSearchUrl(
  location = ORGANIZATION_LOCATION
) {
  return `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
}

export function buildWazeNavigationUrl(
  location = ORGANIZATION_LOCATION
) {
  return `https://waze.com/ul?ll=${location.latitude},${location.longitude}&navigate=yes`;
}

export function buildGoogleMapsEmbedUrl(
  location = ORGANIZATION_LOCATION
) {
  return `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&hl=he&z=16&output=embed`;
}
