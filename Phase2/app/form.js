function $(id) {
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

function showFormMessage(message, isError = false) {
  let messageBox = $("formMessage");

  if (!messageBox) {
    messageBox = document.createElement("p");
    messageBox.id = "formMessage";
    messageBox.className = "mt-4 text-sm";
    $("resourceForm")?.appendChild(messageBox);
  }

  messageBox.textContent = message;
  messageBox.className = `mt-4 text-sm ${
    isError ? "text-red-600" : "text-green-600"
  }`;
}

function getValidatedPayload(actionValue) {
  const resourceName = cleanText($("resourceName")?.value ?? "");
  const resourceDescription = cleanText($("resourceDescription")?.value ?? "");
  const resourceAvailable = $("resourceAvailable")?.value ?? "";
  const resourcePrice = $("resourcePrice")?.value ?? "";
  const resourcePriceUnit = $("resourcePriceUnit")?.value ?? "";

  const requiredFieldsValid =
    isNameValid(resourceName) && isDescriptionValid(resourceDescription);

  const optionalFieldsValid =
    isAvailabilityValid(resourceAvailable) &&
    isPriceValid(resourcePrice) &&
    isPriceUnitValid(resourcePriceUnit);

  if (!requiredFieldsValid || !optionalFieldsValid) {
    return null;
  }

  const payload = {
    action: actionValue,
    resourceName,
    resourceDescription,
  };

  if (resourceAvailable !== "") {
    payload.resourceAvailable = resourceAvailable === "true";
  }

  if (resourcePrice !== "") {
    payload.resourcePrice = Number(resourcePrice);
  }

  if (resourcePriceUnit !== "") {
    payload.resourcePriceUnit = resourcePriceUnit;
  }

  return payload;
}

async function onSubmit(event) {
  event.preventDefault();

  const submitter = event.submitter;
  const actionValue = submitter?.value || "create";
  const payload = getValidatedPayload(actionValue);

  if (!payload) {
    showFormMessage("Please fix the invalid fields before submitting.", true);
    return;
  }

  try {
    const response = await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Server response:", data);
    console.log("Sent payload:", payload);

    showFormMessage("Resource submitted successfully.");
  } catch (error) {
    console.error("POST error:", error);
    showFormMessage("Server request failed. Please try again.", true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = $("resourceForm");

  if (!form) {
    console.warn('resourceForm not found. Make sure the form has id="resourceForm".');
    return;
  }

  form.addEventListener("submit", onSubmit);
});
