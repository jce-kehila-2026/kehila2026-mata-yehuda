import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPageMeta } from "../seo/pageMeta";
import { SITE_NAME } from "../seo/siteConfig";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getPageMeta(pathname);

    document.title = meta.title;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: meta.description,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: meta.robots,
    });

    upsertLink("canonical", meta.canonical);

    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: meta.title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: meta.description,
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: meta.canonical,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: meta.ogImage,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: SITE_NAME,
    });
    upsertMeta('meta[property="og:locale"]', {
      property: "og:locale",
      content: "he_IL",
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: meta.title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: meta.description,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: meta.ogImage,
    });
  }, [pathname]);

  return null;
}

export default SeoManager;
