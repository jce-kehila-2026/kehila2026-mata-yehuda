let activeScrollId = 0;
let highlightTimeoutId = null;

function getNavbarOffset() {
  const navbar = document.querySelector(".home-navbar");
  return (navbar?.offsetHeight ?? 80) + 16;
}

export function scrollToHomeSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (!element) {
    return false;
  }

  const scrollId = ++activeScrollId;

  // Stop an in-progress smooth scroll so rapid nav clicks don't get stuck.
  window.scrollTo({ top: window.scrollY, behavior: "auto" });

  const targetTop =
    element.getBoundingClientRect().top + window.scrollY - getNavbarOffset();

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: "smooth",
  });

  document
    .querySelectorAll(".section-highlight")
    .forEach((node) => node.classList.remove("section-highlight"));

  element.classList.add("section-highlight");

  if (highlightTimeoutId) {
    window.clearTimeout(highlightTimeoutId);
  }

  highlightTimeoutId = window.setTimeout(() => {
    if (scrollId === activeScrollId) {
      element.classList.remove("section-highlight");
    }
  }, 2000);

  return true;
}
