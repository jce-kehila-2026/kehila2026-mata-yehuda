import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "./siteConfig";

const PUBLIC_PAGES = {
  "/": {
    title: `${SITE_NAME} | קהילה תומכת, מרכז יום ופעילויות`,
    description: DEFAULT_DESCRIPTION,
  },
  "/about": {
    title: `מי אנחנו | ${SITE_NAME}`,
    description:
      "הכירו את עמותת ותיקי מטה יהודה — חזון, צוות ושירותים לשיפור איכות החיים של אזרחים ותיקים במטה יהודה.",
  },
  "/services": {
    title: `שירותים | ${SITE_NAME}`,
    description:
      "שירותים לוותיקי מטה יהודה: מרכז יום, קהילה תומכת, פעילויות, התנדבות ועוד.",
  },
  "/day-center": {
    title: `מרכז יום לוותיק | ${SITE_NAME}`,
    description:
      "מרכז היום לוותיק במטה יהודה — מסגרת חברתית, פעילויות ותמיכה יומיומית לאזרחים ותיקים.",
  },
  "/plus60": {
    title: `פעילויות 60+ | ${SITE_NAME}`,
    description:
      "פעילויות והעשרה לגיל השלישי במטה יהודה — חוגים, מפגשים קהילתיים ואירועים.",
  },
  "/supportive-community": {
    title: `קהילה תומכת | ${SITE_NAME}`,
    description:
      "תוכנית קהילה תומכת של ותיקי מטה יהודה — ליווי, ביטחון אישי וסיוע בבית לוותיקים.",
  },
  "/community-join": {
    title: `הצטרפות לקהילה התומכת | ${SITE_NAME}`,
    description:
      "הצטרפו לקהילה התומכת של ותיקי מטה יהודה וקבלו ליווי וסיוע בקהילה.",
  },
  "/community-volunteer": {
    title: `התנדבות בקהילה התומכת | ${SITE_NAME}`,
    description:
      "התנדבו בקהילה התומכת של ותיקי מטה יהודה ועזרו לוותיקים באזור.",
  },
  "/community-service-request": {
    title: `בקשת סיוע | ${SITE_NAME}`,
    description: "בקשת סיוע במסגרת הקהילה התומכת של ותיקי מטה יהודה.",
  },
  "/donations": {
    title: `תרומות | ${SITE_NAME}`,
    description:
      "תרמו לעמותת ותיקי מטה יהודה ותמכו בפעילויות, במרכז היום ובקהילה התומכת.",
  },
};

const NOINDEX_PREFIXES = [
  "/staff",
  "/staff-login",
  "/attendance",
  "/requests",
  "/pay",
  "/payment-",
  "/donations/success",
  "/donations/cancel",
];

function isNoIndexPath(pathname) {
  return NOINDEX_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix)
  );
}

export function getPageMeta(pathname) {
  const normalized = pathname.endsWith("/") && pathname !== "/"
    ? pathname.slice(0, -1)
    : pathname;

  const page = PUBLIC_PAGES[normalized];
  const noindex = isNoIndexPath(normalized) || !page;

  if (page) {
    return {
      title: page.title,
      description: page.description,
      canonical: `${SITE_URL}${normalized === "/" ? "/" : normalized}`,
      robots: "index, follow",
      ogImage: DEFAULT_OG_IMAGE,
    };
  }

  return {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    canonical: `${SITE_URL}${normalized}`,
    robots: noindex ? "noindex, nofollow" : "index, follow",
    ogImage: DEFAULT_OG_IMAGE,
  };
}
