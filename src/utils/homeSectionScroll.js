let activeScrollId = 0;
let highlightTimeoutId = null;

export function getNavbarOffset() {
  const navbar = document.querySelector(".home-navbar");
  return (navbar?.offsetHeight ?? 80) + 16;
}

function computeScrollTop(element) {
  const navbarOffset = getNavbarOffset();
  const padding = 20;
  const viewportHeight = window.innerHeight;
  const availableHeight = viewportHeight - navbarOffset - padding;

  const elementTop = element.getBoundingClientRect().top + window.scrollY;
  const elementHeight = element.offsetHeight;

  if (elementHeight <= availableHeight) {
    const verticalOffset = (availableHeight - elementHeight) / 2;
    return Math.max(0, elementTop - navbarOffset - verticalOffset);
  }

  const requestHeader = element.querySelector(".request-section-header");
  const requestSection = element.querySelector(".request-section");

  if (requestHeader && requestSection) {
    const headerTop =
      requestHeader.getBoundingClientRect().top + window.scrollY;
    const sectionBottom =
      requestSection.getBoundingClientRect().bottom + window.scrollY;
    const blockHeight = sectionBottom - headerTop;

    if (blockHeight <= availableHeight) {
      const verticalOffset = (availableHeight - blockHeight) / 2;
      return Math.max(0, headerTop - navbarOffset - verticalOffset);
    }

    const sectionTop =
      requestSection.getBoundingClientRect().top + window.scrollY;
    const sectionHeight = requestSection.offsetHeight;

    if (sectionHeight <= availableHeight) {
      const verticalOffset = (availableHeight - sectionHeight) / 2;
      return Math.max(0, sectionTop - navbarOffset - verticalOffset);
    }
  }

  return Math.max(0, elementTop - navbarOffset);
}

export function scrollToHomeSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (!element) {
    return false;
  }

  const scrollId = ++activeScrollId;

  window.scrollTo({ top: window.scrollY, behavior: "auto" });

  const targetTop = computeScrollTop(element);

  window.scrollTo({
    top: targetTop,
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
