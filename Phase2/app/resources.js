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
  return (value ?? "").trim().replace(/\s+/g, " ");
}

function isNameValid(value) {
  return cleanText(value).length > 0;
}

function isDescriptionValid(value) {
  return cleanText(value).length > 0;
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

function clearFeedback(inputId) {
  const feedback = getOrCreateFeedbackElement(inputId);
  if (!feedback) return;
  feedback.textContent = "";
  feedback.className = "mt-1 text-sm";
}

function validateName(showFeedback = true) {
  const input = getField("resourceName");
  if (!input) return false;

  const cleaned = cleanText(input.value);

  if (cleaned === "") {
    setInputVisualState(input, "invalid");
    if (showFeedback) {
      setFeedback("resourceName", "Resource name is required.", false);
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

  const cleaned = cleanText(input.value);

  if (cleaned === "") {
    setInputVisualState(input, "invalid");
    if (showFeedback) {
      setFeedback("resourceDescription", "Resource description is required.", false);
    }
    return false;
  }

  setInputVisualState(input, "valid");
  if (showFeedback) {
    setFeedback("resourceDescription", "Resource description looks good.", true);
  }
  return true;
}

function validateOptionalField(input, valid, message) {
  if (!input) return true;

  if (input.value === "") {
    setInputVisualState(input, "");
    return true;
  }

  if (valid) {
    setInputVisualState(input, "valid");
    return true;
  }

  setInputVisualState(input, "invalid");
  return false;
}

function validateForm(showFeedback = true) {
  const nameInput = getField("resourceName");
  const descriptionInput = getField("resourceDescription");
  const availableInput = getField("resourceAvailable");
  const priceInput = getField("resourcePrice");
  const priceUnitInput = getField("resourcePriceUnit");

  const nameHasValue = cleanText(nameInput?.value ?? "") !== "";
  const descriptionHasValue = cleanText(descriptionInput?.value ?? "") !== "";

  const nameValid = showFeedback || nameHasValue ? validateName(showFeedback) : false;
  const descriptionValid =
    showFeedback || descriptionHasValue ? validateDescription(showFeedback) : false;

  if (!showFeedback && !nameHasValue && nameInput) {
    setInputVisualState(nameInput, "");
    clearFeedback("resourceName");
  }

  if (!showFeedback && !descriptionHasValue && descriptionInput) {
    setInputVisualState(descriptionInput, "");
    clearFeedback("resourceDescription");
  }

  const availableValid = isAvailabilityValid(availableInput?.value ?? "");
  const priceValid = isPriceValid(priceInput?.value ?? "");
  const priceUnitValid = isPriceUnitValid(priceUnitInput?.value ?? "");

  validateOptionalField(availableInput, availableValid);
  validateOptionalField(priceInput, priceValid);
  validateOptionalField(priceUnitInput, priceUnitValid);

  const allValid =
    nameValid &&
    descriptionValid &&
    availableValid &&
    priceValid &&
    priceUnitValid;

  setButtonEnabled(createButton, allValid);
  return allValid;
}

function attachValidation() {
  const nameField = getField("resourceName");
  const descriptionField = getField("resourceDescription");
  const optionalFields = [
    getField("resourceAvailable"),
    getField("resourcePrice"),
    getField("resourcePriceUnit"),
  ];

  if (nameField) {
    nameField.addEventListener("input", () => validateForm(true));
    nameField.addEventListener("blur", () => validateForm(true));
  }

  if (descriptionField) {
    descriptionField.addEventListener("input", () => validateForm(true));
    descriptionField.addEventListener("blur", () => validateForm(true));
  }

  optionalFields.forEach((field) => {
    if (!field) return;
    field.addEventListener("input", () => validateForm(true));
    field.addEventListener("change", () => validateForm(true));
    field.addEventListener("blur", () => validateForm(true));
  });

  validateForm(false);
}

document.addEventListener("DOMContentLoaded", () => {
  renderActionButtons(role);
  attachValidation();
});
