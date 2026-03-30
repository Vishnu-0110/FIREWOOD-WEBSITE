const navLinks = document.querySelectorAll(".site-nav a");
const currentPage = document.body.getAttribute("data-page");
const yearNode = document.getElementById("year");
const serviceTypeSelect = document.getElementById("serviceType");
const inquiryForm = document.getElementById("quickInquiryForm");
const formFeedback = document.getElementById("formFeedback");
const availabilityStatus = document.getElementById("availabilityStatus");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

navLinks.forEach((link) => {
  if (link.dataset.page === currentPage) {
    link.classList.add("active");
  }
});

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
