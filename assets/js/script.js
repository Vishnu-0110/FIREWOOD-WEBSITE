const body = document.body;
const currentPage = body.getAttribute("data-page");
const navLinks = document.querySelectorAll(".site-nav a");
const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.querySelector(".nav-panel");
const yearNode = document.getElementById("year");
const serviceTypeSelect = document.getElementById("serviceType");
const inquiryForm = document.getElementById("quickInquiryForm");
const formFeedback = document.getElementById("formFeedback");
const availabilityStatus = document.getElementById("availabilityStatus");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const siteBrand = document.querySelector(".brand");
const introStorageKey = "vlf_brand_intro_seen_v5";

const getIntroFlag = () => {
  try {
    return window.localStorage.getItem(introStorageKey);
  } catch {
    return null;
  }
};

const setIntroFlag = () => {
  try {
    window.localStorage.setItem(introStorageKey, "1");
  } catch {
    // If storage is unavailable, the intro still works for this page load.
  }
};

const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const waitForFonts = async () => {
  if (!document.fonts || !document.fonts.ready) {
    return;
  }

  await Promise.race([document.fonts.ready, wait(1200)]);
};

const playBrandIntro = async () => {
  const introPending = document.documentElement.classList.contains("brand-intro-first-visit");

  if (!siteBrand || prefersReducedMotion || !introPending || getIntroFlag() === "1") {
    return;
  }

  const targetRect = siteBrand.getBoundingClientRect();

  if (!targetRect.width || !targetRect.height) {
    document.documentElement.classList.remove("brand-intro-first-visit");
    return;
  }

  setIntroFlag();

  const introLayer = document.createElement("div");
  introLayer.className = "brand-intro-overlay";
  introLayer.setAttribute("aria-hidden", "true");

  const introBrand = siteBrand.cloneNode(true);
  introBrand.classList.add("brand-intro-clone", "is-typing");
  introBrand.removeAttribute("href");
  introBrand.setAttribute("tabindex", "-1");
  introBrand.setAttribute("aria-hidden", "true");

  const introTag = introBrand.querySelector(".brand-tag");
  if (introTag) {
    introTag.remove();
  }

  const introName = introBrand.querySelector(".brand-name");
  if (!introName) {
    document.documentElement.classList.remove("brand-intro-first-visit");
    return;
  }

  introName.textContent = "";
  introLayer.appendChild(introBrand);
  body.prepend(introLayer);

  const introScale = Math.min(2.2, Math.max(1.15, (window.innerWidth - 48) / targetRect.width));
  introBrand.style.left = "50%";
  introBrand.style.top = "50%";
  introBrand.style.opacity = "1";
  introBrand.style.transform = `translate(-50%, -50%) scale(${introScale})`;
  introBrand.style.transformOrigin = "center center";

  const brandText = "VIJAYALAKSHMI FIREWOOD SUPPLIERS";

  try {
    await waitForFonts();
    await nextFrame();

    for (const character of brandText) {
      introName.textContent += character;
      await wait(character === " " ? 100 : 55);
    }

    await wait(1000);

    introBrand.classList.remove("is-typing");
    const startRect = introBrand.getBoundingClientRect();
    const targetRect = siteBrand.getBoundingClientRect();
    introBrand.style.transition = "none";
    introBrand.style.left = `${targetRect.left}px`;
    introBrand.style.top = `${targetRect.top}px`;
    introBrand.style.width = `${targetRect.width}px`;
    introBrand.style.height = `${targetRect.height}px`;
    introBrand.style.transformOrigin = "top left";
    const startX = startRect.left - targetRect.left;
    const startY = startRect.top - targetRect.top;
    const startScaleX = startRect.width / targetRect.width;
    const startScaleY = startRect.height / targetRect.height;
    introBrand.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale3d(${startScaleX}, ${startScaleY}, 1)`;
    introBrand.style.opacity = "1";
    introBrand.style.filter = "blur(0)";
    introBrand.getBoundingClientRect();
    await nextFrame();

    introBrand.style.transition = "transform 900ms ease-in-out";
    await nextFrame();
    await new Promise((resolve) => {
      let finished = false;
      const cleanup = () => {
        if (finished) {
          return;
        }

        finished = true;
        introLayer.remove();
        document.documentElement.classList.remove("brand-intro-first-visit");
        resolve();
      };

      const fallbackTimer = window.setTimeout(cleanup, 1300);

      introBrand.addEventListener(
        "transitionend",
        (event) => {
          if (event.propertyName !== "transform") {
            return;
          }

          window.clearTimeout(fallbackTimer);
          cleanup();
        },
        { once: true }
      );

      introBrand.style.transform = "translate3d(0, 0, 0) scale3d(1, 1, 1)";
    });
  } catch (error) {
    introLayer.remove();
    document.documentElement.classList.remove("brand-intro-first-visit");
  }
};

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (document.readyState === "complete") {
  window.requestAnimationFrame(() => {
    playBrandIntro();
  });
} else {
  window.addEventListener(
    "load",
    () => {
      window.requestAnimationFrame(() => {
        playBrandIntro();
      });
    },
    { once: true }
  );
}

navLinks.forEach((link) => {
  if (link.dataset.page === currentPage) {
    link.classList.add("active");
  }
});

if (navToggle && navPanel) {
  const closeNav = () => {
    navToggle.setAttribute("aria-expanded", "false");
    navPanel.classList.remove("is-open");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navPanel.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeNav();
    }
  });
}

const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
scrollProgress.setAttribute("aria-hidden", "true");
scrollProgress.innerHTML = "<span></span>";
body.prepend(scrollProgress);

const progressFill = scrollProgress.querySelector("span");
const revealTargets = document.querySelectorAll("[data-reveal]");
const staggerGroups = document.querySelectorAll("[data-stagger]");

staggerGroups.forEach((group) => {
  Array.from(group.children).forEach((child, index) => {
    child.style.transitionDelay = `${index * 90}ms`;
  });
});

if (revealTargets.length) {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
  }
}

const updateScrollProgress = () => {
  if (!progressFill) {
    return;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
};

updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);

if (serviceTypeSelect) {
  const queryParams = new URLSearchParams(window.location.search);
  const requestedService = queryParams.get("service");

  if (requestedService) {
    const normalized = requestedService.trim().toLowerCase();
    const matchingOption = Array.from(serviceTypeSelect.options).find(
      (option) => option.value.trim().toLowerCase() === normalized
    );

    if (matchingOption) {
      serviceTypeSelect.value = matchingOption.value;
    }
  }
}

if (availabilityStatus) {
  const hourPart = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    hour12: false,
  })
    .formatToParts(new Date())
    .find((part) => part.type === "hour");

  const currentHour = hourPart ? Number(hourPart.value) : 0;
  const isOpen = currentHour >= 7 && currentHour < 21;

  availabilityStatus.classList.add(isOpen ? "open" : "closed");
  availabilityStatus.textContent = isOpen
    ? "Status: Available now for call and WhatsApp inquiries."
    : "Status: You can send your requirement now and we will respond as early as possible.";
}

if (inquiryForm) {
  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const customerName = document.getElementById("customerName").value.trim();
    const businessType = document.getElementById("businessType").value.trim();
    const serviceType = document.getElementById("serviceType").value.trim();
    const quantityRaw = document.getElementById("quantity").value.trim();
    const requirementDetails = document.getElementById("requirementDetails").value.trim();

    if (!customerName || !businessType || !serviceType || !quantityRaw) {
      formFeedback.textContent = "Please fill in name, business type, firewood type, and quantity.";
      formFeedback.className = "form-feedback error";
      return;
    }

    const quantityValue = Number(quantityRaw);

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      formFeedback.textContent = "Please enter quantity as a valid number greater than zero.";
      formFeedback.className = "form-feedback error";
      return;
    }

    const formattedQuantity = Number.isInteger(quantityValue)
      ? quantityValue.toString()
      : quantityValue.toFixed(2).replace(/\.?0+$/, "");

    const message = [
      "Hello VIJAYA LAKSHMI FIREWOOD SUPPLIERS,",
      "",
      "I need a bulk firewood quotation.",
      `Name: ${customerName}`,
      `Business Type: ${businessType}`,
      `Firewood Type: ${serviceType}`,
      `Approx Quantity: ${formattedQuantity} Tons`,
      `Requirement Details: ${requirementDetails || "Not specified"}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/917598244292?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener");

    formFeedback.textContent = "WhatsApp opened with your inquiry details.";
    formFeedback.className = "form-feedback success";
  });
}
