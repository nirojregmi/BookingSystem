// ===============================
// Form handling for resources page
// ===============================

// -------------- Helpers --------------
function $(id) {
  return document.getElementById(id);
}

function getFormMessageEl() {
  return document.getElementById("formMessage");
}

/**
 * Show a success/error/info message in the UI.
 * type: "success" | "error" | "info"
 */
function showFormMessage(type, message) {
  const el = getFormMessageEl();
  if (!el) return;

  el.className = "mt-6 rounded-2xl border px-4 py-3 text-sm whitespace-pre-line";
  el.classList.remove("hidden");

  if (type === "success") {
    el.classList.add("border-emerald-200", "bg-emerald-50", "text-emerald-900");
  } else if (type === "info") {
    el.classList.add("border-amber-200", "bg-amber-50", "text-amber-900");
  } else {
    el.classList.add("border-rose-200", "bg-rose-50", "text-rose-900");
  }

  el.textContent = message;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearFormMessage() {
  const el = getFormMessageEl();
  if (!el) return;
  el.textContent = "";
  el.classList.add("hidden");
}

/**
 * Try to read JSON from the response.
 */
async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return { ok: false, error: "Invalid JSON response" };
    }
  }

  const text = await response.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: "Non-JSON response", raw: text };
  }
}

/**
 * Format ISO date string
 */
function formatCreatedAt(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);

  const pad = (value) => String(value).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Build validation error message
 */
function buildValidationMessage(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return "Your request was blocked by server-side validation.";
  }

  const lines = errors.map((e) => {
    const field = e.field || "field";
    const msg = e.msg || "Invalid value";
    return `• ${field}: ${msg}`;
  });

  return `Your request was blocked by server-side validation:\n\n${lines.join("\n")}`;
}

/**
 * Generic API error message
 */
function buildGenericErrorMessage(status, body) {
  const details = body?.details ? `\n\nDetails: ${body.details}` : "";
  const error = body?.error ? body.error : "Request failed";
  return `Something went wrong while saving the resource.\n\nStatus: ${status}\nReason: ${error}${details}`;
}

// -------------- Form wiring --------------
document.addEventListener("DOMContentLoaded", () => {
  const form = $("resourceForm");
  if (!form) return;

  form.addEventListener("submit", onSubmit);
});

async function onSubmit(event) {
  event.preventDefault();

  const submitter = event.submitter;
  const actionValue = submitter && submitter.value ? submitter.value : "create";

  const selectedUnit =
    document.querySelector('input[name="resourcePriceUnit"]:checked')?.value ?? "";

  const priceRaw = $("resourcePrice")?.value ?? "";
  const resourcePrice = priceRaw === "" ? 0 : Number(priceRaw);

  const payload = {
    action: actionValue,
    resourceName: $("resourceName")?.value ?? "",
    resourceDescription: $("resourceDescription")?.value ?? "",
    resourceAvailable: $("resourceAvailable")?.checked ?? false,
    resourcePrice,
    resourcePriceUnit: selectedUnit,
  };

  try {
    clearFormMessage();

    const response = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await readResponseBody(response);

    // -----------------------------
    // Error handling
    // -----------------------------
    if (!response.ok) {

      if (response.status === 400) {
        const msg = buildValidationMessage(body?.errors);
        showFormMessage("error", msg);
        return;
      }

      if (response.status === 409) {
        showFormMessage(
          "info",
          "Duplicate blocked (409):\n\nA resource with the same name already exists."
        );
        return;
      }

      showFormMessage("error", buildGenericErrorMessage(response.status, body));
      return;
    }

    // -----------------------------
    // Success message
    // -----------------------------
    const resourceName = body?.data?.name ?? "";
    const createdAt = formatCreatedAt(body?.data?.created_at);
    const resourceId = body?.data?.id ?? "";

    const msgLines = [];
    msgLines.push(`Name ➡️ ${resourceName}`);
    msgLines.push(`Created at ➡️ ${createdAt}`);
    msgLines.push(`ID in database ➡️ ${resourceId}`);

    showFormMessage("success", msgLines.join("\n"));

    if (typeof window.onResourceActionSuccess === "function") {
      window.onResourceActionSuccess({
        action: actionValue,
        data: "success"
      });
    }

  } catch (err) {
    console.error("POST error:", err);

    showFormMessage(
      "error",
      "Network error: Could not reach the server. Please try again."
    );
  }
}
