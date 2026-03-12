const actions = document.getElementById("resourceActions");

const role = "admin"; // reserver | admin

let createButton = null;
let updateButton = null;
let deleteButton = null;

const BUTTON_BASE_CLASSES =
  "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";
const BUTTON_ENABLED_CLASSES =
  "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";

function addButton({ label, type = "button", value, classes = "" }) {
  const button = document.createElement("button");
  button.type = type;
  button.textContent = label;
  button.name = "action";
  if (value) button.value = value;
  button.className = `${BUTTON_BASE_CLASSES} ${classes}`.trim();
  actions.appendChild(button);
  return button;
}

function setButtonEnabled(button, enabled) {
  if (!button) return;

  button.disabled = !enabled;
  button.classList.toggle("cursor-not-allowed", !enabled);
  button.classList.toggle("opacity-50", !enabled);

  if (enabled) {
    button.classList.add("hover:bg-brand-dark/80");
  } else {
    button.classList.remove("hover:bg-brand-dark/80");
  }
}

function renderActionButtons(currentRole) {
  if (currentRole === "reserver") {
    createButton = addButton({
      label: "Create",
      type: "submit",
      value: "create",
      classes: BUTTON_ENABLED_CLASSES,
    });
  }

  if (currentRole === "admin") {
    createButton = addButton({
      label: "Create",
      type: "submit",
      value: "create",
      classes: BUTTON_ENABLED_CLASSES,
    });

    updateButton = addButton({
      label: "Update",
      type: "submit",
      value: "update",
      classes: BUTTON_ENABLED_CLASSES,
    });

    deleteButton = addButton({
      label: "Delete",
      type: "submit",
      value: "delete",
      classes: BUTTON_ENABLED_CLASSES,
    });
  }

  setButtonEnabled(createButton, false);
}

function getField(id) {
  return document.getElementById(id);
}

function cleanText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function isAllowedText(value, min, max) {
  const cleaned = cleanText(value);
  const allowedPattern = /^[a-zA-Z0-9äöåÄÖÅ ]+$/;

  return (
    cleaned.length >= min &&
    cleaned.length <= max &&
    allowedPattern.test(cleaned)
  );
}

function isNameValid(value) {
  return isAllowedText(value, 5, 30);
}

function isDescriptionValid(value) {
  return isAllowedText(value, 10, 50);
}

function isAvailabilityValid(value) {
  return value === "" || value === "true" || value === "false";
}

function isPriceValid(value) {
  if (value === "") return true;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
}

function isPriceUnitValid(value) {
  return value === "" || ["hour", "day", "week", "month"].includes(value);
}

function setInputVisualState(input, state) {
  if (!input) return;

  input.classList.remove(
    "border-green-500",
    "bg-green-100",
    "focus:ring-green-500/30",
    "border-red-500",
    "bg-red-100",
    "focus:ring-red-500/30"
  );

  input.classList.add("focus:ring-2");

  if (state === "valid") {
    input.classList.add(
      "border-green-500",
      "bg-green-100",
      "focus:ring-green-500/30"
    );
    input.setAttribute("aria-invalid", "false");
  } else if (state === "invalid") {
    input.classList.add(
      "border-red-500",
      "bg-red-100",
      "focus:ring-red-500/30"
    );
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }
}

function getOrCreateFeedbackElement(inputId) {
  const input = getField(inputId);
  if (!input) return null;

  const messageId = `${inputId}Feedback`;
  let feedback = document.getElementById(messageId);

  if (!feedback) {
    feedback = document.createElement("p");
    feedback.id = messageId;
    feedback.className = "mt-1 text-sm";
    input.insertAdjacentElement("afterend", feedback);
  }

  return feedback;
}

function setFeedback(inputId, message, isValid) {
  const feedback = getOrCreateFeedbackElement(inputId);
  if (!feedback) return;

  feedback.textContent = message;
  feedback.className = `mt-1 text-sm ${
    isValid ? "text-green-600" : "text-red-600"
  }`;
}

function validateName(showFeedback = true) {
  const input = getField("resourceName");
  if (!input) return false;

  const rawValue = input.value ?? "";
  const cleaned = cleanText(rawValue);

  if (cleaned === "") {
    setInputVisualState(input, "invalid");
    if (showFeedback) {
      setFeedback("resourceName", "Resource name is required.", false);
    }
    return false;
  }

  if (!/^[a-zA-Z0-9äöåÄÖÅ ]+$/.test(cleaned)) {
    setInputVisualState(input, "invalid");
    if (showFeedback) {
      setFeedback(
        "resourceName",
        "Use only letters, numbers, and spaces.",
        false
      );
    }
    return false;
  }

  if (cleaned.length < 5 || cleaned.length > 30) {
    setInputVisualState(input, "invalid");
    if (showFeedback) {
      setFeedback(
        "resourceName",
        "Resource name must be 5–30 characters long.",
        false
      );
    }
    return false;
  }

  setInputVisualState(input, "valid");
  if (showFeedback) {
    setFeedback("resourceName", "Resource name looks good.", true);
  }
  return true;
}

function validateDescription(showFeedback = true) {
  const input = getField("resourceDescription");
  if (!input) return false;

  const rawValue = input.value ?? "";
  const cleaned = cleanText(rawValue);

  if (cleaned === "") {
    setInputVisualState(input, "invalid");
    if (showFeedback) {
      setFeedback("resourceDescription", "Resource description is required.", false);
    }
    return false;
  }

  if (!/^[a-zA-Z0-9äöåÄÖÅ ]+$/.test(cleaned)) {
    setInputVisualState(input, "invalid");
    if (showFeedback) {
      setFeedback(
        "resourceDescription",
        "Use only letters, numbers, and spaces.",
        false
      );
    }
    return false;
  }

  if (cleaned.length < 10 || cleaned.length > 50) {
    setInputVisualState(input, "invalid");
    if (showFeedback) {
      setFeedback(
        "resourceDescription",
        "Resource description must be 10–50 characters long.",
        false
      );
    }
    return false;
  }

  setInputVisualState(input, "valid");
  if (showFeedback) {
    setFeedback("resourceDescription", "Resource description looks good.", true);
  }
  return true;
}

function validateForm() {
  const nameValid = validateName(true);
  const descriptionValid = validateDescription(true);

  const availableInput = getField("resourceAvailable");
  const priceInput = getField("resourcePrice");
  const priceUnitInput = getField("resourcePriceUnit");

  const availableValid = isAvailabilityValid(availableInput?.value ?? "");
  const priceValid = isPriceValid(priceInput?.value ?? "");
  const priceUnitValid = isPriceUnitValid(priceUnitInput?.value ?? "");

  const allValid = nameValid && descriptionValid && availableValid && priceValid && priceUnitValid;

  setButtonEnabled(createButton, allValid);
  return allValid;
}

function attachValidation() {
  const fields = [
    "resourceName",
    "resourceDescription",
    "resourceAvailable",
    "resourcePrice",
    "resourcePriceUnit",
  ];

  fields.forEach((id) => {
    const field = getField(id);
    if (!field) return;

    field.addEventListener("input", validateForm);
    field.addEventListener("change", validateForm);
    field.addEventListener("blur", validateForm);
  });

  validateForm();
}

document.addEventListener("DOMContentLoaded", () => {
  renderActionButtons(role);
  attachValidation();
});