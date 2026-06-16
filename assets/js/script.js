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

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
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
