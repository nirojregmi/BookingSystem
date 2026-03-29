import { initAuthUI, updateHomePageUI, logout } from "./auth-ui.js";

window.logout = logout;

async function loadBookings() {
  const tableBody = document.getElementById("bookingsTableBody");
  if (!tableBody) return;

  try {
    const response = await fetch("/api/reservations", {
      headers: {
        Accept: "application/json",
      },
    });

    const body = await response.json();

    if (!response.ok) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="3" class="px-4 py-6 text-slate-500">
            Could not load bookings.
          </td>
        </tr>
      `;
      return;
    }

    const items = body?.data || [];

    if (!items.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="3" class="px-4 py-6 text-slate-500">
            No bookings found.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = items
      .map((item) => {
        const resourceName = item.resource_name || `Resource #${item.resource_id}`;
        const start = item.start_time
          ? new Date(item.start_time).toLocaleString()
          : "-";
        const end = item.end_time
          ? new Date(item.end_time).toLocaleString()
          : "-";

        return `
          <tr class="border-b border-slate-100">
            <td class="px-4 py-4">${resourceName}</td>
            <td class="px-4 py-4">${start}</td>
            <td class="px-4 py-4">${end}</td>
          </tr>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Failed to load bookings:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" class="px-4 py-6 text-slate-500">
          Server error while loading bookings.
        </td>
      </tr>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initAuthUI();
  updateHomePageUI();
  loadBookings();
});
