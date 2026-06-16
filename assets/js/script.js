const navLinks = document.querySelectorAll(".site-nav a");
const currentPage = document.body.getAttribute("data-page");
const yearNode = document.getElementById("year");
const serviceTypeSelect = document.getElementById("serviceType");
const inquiryForm = document.getElementById("quickInquiryForm");
const formFeedback = document.getElementById("formFeedback");
const availabilityStatus = document.getElementById("availabilityStatus");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const parallaxTargets = document.querySelectorAll(
  ".hero-media img, .visual-box img, .service-card img"
);

const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
scrollProgress.setAttribute("aria-hidden", "true");
scrollProgress.innerHTML = "<span></span>";
document.body.prepend(scrollProgress);
const progressFill = scrollProgress.querySelector("span");

let woodCursor = null;
let cursorRaf = 0;
let cursorX = 0;
let cursorY = 0;
let cursorVisible = false;

if (finePointer && !reduceMotion) {
  document.body.classList.add("has-wood-cursor");
  woodCursor = document.createElement("div");
  woodCursor.className = "wood-cursor";
  woodCursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(woodCursor);
}

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

navLinks.forEach((link) => {
  if (link.dataset.page === currentPage) {
    link.classList.add("active");
  }
});

const staggerGroups = document.querySelectorAll("[data-stagger]");
staggerGroups.forEach((group) => {
  Array.from(group.children).forEach((child, index) => {
    child.style.setProperty("--reveal-delay", `${index * 110}ms`);
  });
});

const revealTargets = document.querySelectorAll("[data-reveal]");

if (revealTargets.length) {
  if (reduceMotion || !("IntersectionObserver" in window)) {
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
        threshold: 0.18,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    revealTargets.forEach((item) => revealObserver.observe(item));
  }
}

const updateScrollProgress = () => {
  if (!progressFill) {
    return;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
};

const updateParallax = () => {
  if (!parallaxTargets.length) {
    return;
  }

  const viewportCenter = window.innerHeight / 2;
  parallaxTargets.forEach((target) => {
    const rect = target.getBoundingClientRect();
    const distanceFromCenter = rect.top + rect.height / 2 - viewportCenter;
    const offset = Math.max(-16, Math.min(16, -distanceFromCenter * 0.03));
    target.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
  });
};

const updateVisualMotion = () => {
  updateScrollProgress();
  updateParallax();
};

updateVisualMotion();
window.addEventListener("scroll", updateVisualMotion, { passive: true });
window.addEventListener("resize", updateVisualMotion, { passive: true });

if (woodCursor) {
  const animateCursor = () => {
    if (!woodCursor) {
      return;
    }
    woodCursor.style.left = `${cursorX}px`;
    woodCursor.style.top = `${cursorY}px`;
    woodCursor.style.setProperty("--cursor-scale", cursorVisible ? "1" : "0.6");
  };

  const requestCursorFrame = () => {
    if (cursorRaf) {
      return;
    }
    cursorRaf = window.requestAnimationFrame(() => {
      cursorRaf = 0;
      animateCursor();
    });
  };

  window.addEventListener("pointermove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursorVisible = true;
    woodCursor.classList.add("is-visible");
    requestCursorFrame();
  });

  window.addEventListener("pointerdown", () => {
    woodCursor.classList.add("is-dragging");
  });

  window.addEventListener("pointerup", () => {
    woodCursor.classList.remove("is-dragging");
  });

  window.addEventListener("mouseleave", () => {
    cursorVisible = false;
    woodCursor.classList.remove("is-visible");
  });
}

if (serviceTypeSelect) {
  const queryParams = new URLSearchParams(window.location.search);
  const requestedService = queryParams.get("service");
  if (requestedService) {
    const normalizedRequested = requestedService.trim().toLowerCase();
    const matchingOption = Array.from(serviceTypeSelect.options).find(
      (option) => option.value.trim().toLowerCase() === normalizedRequested
    );
    if (matchingOption) {
      serviceTypeSelect.value = matchingOption.value;
    }
  }
}

if (availabilityStatus) {
  const nowInIST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const currentHour = nowInIST.getHours();
  const isOpen = currentHour >= 7 && currentHour < 21;
  availabilityStatus.classList.add(isOpen ? "open" : "closed");
  availabilityStatus.textContent = isOpen
    ? "Status: Available now for inquiry calls and WhatsApp."
    : "Status: You can still send WhatsApp now, I will respond as early as possible.";
}

if (inquiryForm) {
  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const customerName = document.getElementById("customerName").value.trim();
    const businessType = document.getElementById("businessType").value.trim();
    const serviceType = document.getElementById("serviceType").value.trim();
    const quantityRaw = document.getElementById("quantity").value.trim();
    const requirementDetails = document
      .getElementById("requirementDetails")
      .value.trim();

    if (!customerName || !businessType || !serviceType || !quantityRaw) {
      if (formFeedback) {
        formFeedback.textContent =
          "Please fill Name, Business Type, Firewood Type, and Quantity.";
        formFeedback.className = "form-feedback error";
      }
      return;
    }

    const quantityValue = Number(quantityRaw);
    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      if (formFeedback) {
        formFeedback.textContent = "Please enter quantity as a valid number.";
        formFeedback.className = "form-feedback error";
      }
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

    const whatsappURL =
      "https://wa.me/917598244292?text=" + encodeURIComponent(message);

    window.open(whatsappURL, "_blank", "noopener");

    if (formFeedback) {
      formFeedback.textContent = "WhatsApp opened with your inquiry details.";
      formFeedback.className = "form-feedback success";
    }
  });
}
