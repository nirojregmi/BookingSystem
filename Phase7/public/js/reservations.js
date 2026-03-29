import { initAuthUI, logout } from "./auth-ui.js";

initAuthUI();
window.logout = logout;

const reservationForm = document.getElementById("reservationForm");
const reservationIdInput = document.getElementById("reservationId");
const resourceIdInput = document.getElementById("resourceId");
const userIdInput = document.getElementById("userId");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
const noteInput = document.getElementById("note");
const statusInput = document.getElementById("status");
const reservationList = document.getElementById("reservationList");
const formMessage = document.getElementById("formMessage");
const pageMessage = document.getElementById("pageMessage");

function getToken() {
  return localStorage.getItem("token");
}

function showMessage(element, type, text) {
  const styles = {
    success: "border-green-300 bg-green-50 text-green-700",
    error: "border-rose-300 bg-rose-50 text-rose-700",
    info: "border-blue-300 bg-blue-50 text-blue-700",
  };
  element.className = `rounded-2xl border px-4 py-3 text-sm ${styles[type] || styles.info}`;
  element.textContent = text;
  element.classList.remove("hidden");
}

function hideMessage(element) {
  element.className = "hidden";
  element.textContent = "";
}

function toApiDate(value) {
  return value ? new Date(value).toISOString() : "";
}

function toLocalInputValue(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  const pad = (v) => String(v).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getFormData() {
  return {
    resourceId: Number(resourceIdInput.value),
    userId: Number(userIdInput.value),
    startTime: toApiDate(startTimeInput.value),
    endTime: toApiDate(endTimeInput.value),
    note: noteInput.value.trim(),
    status: statusInput.value,
  };
}

function clearForm() {
  reservationIdInput.value = "";
  resourceIdInput.value = "";
  userIdInput.value = "";
  startTimeInput.value = "";
  endTimeInput.value = "";
  noteInput.value = "";
  statusInput.value = "active";
  hideMessage(formMessage);
}

function fillForm(item) {
  reservationIdInput.value = item.id ?? "";
  resourceIdInput.value = item.resource_id ?? "";
  userIdInput.value = item.user_id ?? "";
  startTimeInput.value = toLocalInputValue(item.start_time);
  endTimeInput.value = toLocalInputValue(item.end_time);
  noteInput.value = item.note ?? "";
  statusInput.value = item.status ?? "active";
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let body = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  return { response, body };
}

function renderReservations(items) {
  if (!items.length) {
    reservationList.innerHTML = `<div class="rounded-2xl border border-dashed border-black/10 px-4 py-5 text-sm text-slate-500">No reservations found.</div>`;
    return;
  }

  reservationList.innerHTML = items.map((item) => `
    <article class="rounded-2xl border border-black/10 p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-base font-semibold">Reservation #${item.id}</h3>
          <p class="mt-1 text-sm text-slate-600">${item.resource_name || `Resource #${item.resource_id}`}</p>
          <p class="text-sm text-slate-500">${item.user_email || `User #${item.user_id}`}</p>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase">${item.status || "active"}</span>
      </div>
      <div class="mt-4 space-y-1 text-sm text-slate-600">
        <div><strong>Start:</strong> ${new Date(item.start_time).toLocaleString()}</div>
        <div><strong>End:</strong> ${new Date(item.end_time).toLocaleString()}</div>
        <div><strong>Note:</strong> ${item.note || "-"}</div>
      </div>
      <div class="mt-4 flex gap-2">
        <button type="button" class="load-btn rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white" data-id="${item.id}">Load</button>
        <button type="button" class="remove-btn rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white" data-id="${item.id}">Delete</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".load-btn").forEach((btn) => {
    btn.addEventListener("click", () => loadOneReservation(btn.dataset.id));
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteReservation(btn.dataset.id));
  });
}

async function loadReservations() {
  hideMessage(pageMessage);
  try {
    const { response, body } = await apiFetch("/api/reservations");
    if (!response.ok) {
      showMessage(pageMessage, "error", body?.error || "Failed to load reservations.");
      renderReservations([]);
      return;
    }
    renderReservations(body?.data || []);
  } catch {
    renderReservations([]);
    showMessage(pageMessage, "error", "Unable to contact the server.");
  }
}

async function loadOneReservation(id) {
  const { response, body } = await apiFetch(`/api/reservations/${id}`);
  if (!response.ok) {
    showMessage(formMessage, "error", body?.error || "Failed to load reservation.");
    return;
  }
  fillForm(body.data);
  showMessage(formMessage, "info", `Reservation #${id} loaded.`);
}

async function createReservation() {
  const { response, body } = await apiFetch("/api/reservations", {
    method: "POST",
    body: JSON.stringify(getFormData()),
  });

  if (!response.ok) {
    showMessage(formMessage, "error", body?.error || "Failed to create reservation.");
    return;
  }

  showMessage(formMessage, "success", "Reservation created successfully.");
  clearForm();
  await loadReservations();
}

async function updateReservation() {
  const id = reservationIdInput.value;
  if (!id) {
    showMessage(formMessage, "error", "Load a reservation first.");
    return;
  }

  const { response, body } = await apiFetch(`/api/reservations/${id}`, {
    method: "PUT",
    body: JSON.stringify(getFormData()),
  });

  if (!response.ok) {
    showMessage(formMessage, "error", body?.error || "Failed to update reservation.");
    return;
  }

  showMessage(formMessage, "success", `Reservation #${id} updated.`);
  await loadReservations();
}

async function deleteReservation(id = null) {
  const reservationId = id || reservationIdInput.value;
  if (!reservationId) {
    showMessage(formMessage, "error", "Load a reservation first.");
    return;
  }

  const confirmed = window.confirm(`Delete reservation #${reservationId}?`);
  if (!confirmed) return;

  const { response, body } = await apiFetch(`/api/reservations/${reservationId}`, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    showMessage(formMessage, "error", body?.error || "Failed to delete reservation.");
    return;
  }

  showMessage(formMessage, "success", `Reservation #${reservationId} deleted.`);
  clearForm();
  await loadReservations();
}

reservationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await createReservation();
});

document.getElementById("updateBtn").addEventListener("click", updateReservation);
document.getElementById("deleteBtn").addEventListener("click", () => deleteReservation());
document.getElementById("clearBtn").addEventListener("click", clearForm);
document.getElementById("refreshBtn").addEventListener("click", loadReservations);

document.addEventListener("DOMContentLoaded", loadReservations);
