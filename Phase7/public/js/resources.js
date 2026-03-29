import { initAuthUI, logout } from "./auth-ui.js";

window.logout = logout;

document.addEventListener("DOMContentLoaded", () => {
  initAuthUI();

  const form = document.getElementById("resourceForm");
  const messageBox = document.getElementById("message");
  const listBox = document.getElementById("resourceList");

  function showMessage(type, text) {
    const styles = {
      success: "mt-6 rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700",
      error: "mt-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700",
      info: "mt-6 rounded-2xl border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-700",
    };

    messageBox.className = styles[type] || styles.info;
    messageBox.textContent = text;
    messageBox.classList.remove("hidden");
  }

  async function loadResources() {
    try {
      const response = await fetch("/api/resources");
      const body = await response.json();

      if (!response.ok) {
        listBox.innerHTML = `<div class="rounded-2xl border border-dashed border-black/10 px-4 py-5 text-sm text-slate-500">Failed to load resources.</div>`;
        return;
      }

      const items = body?.data || [];

      if (!items.length) {
        listBox.innerHTML = `<div class="rounded-2xl border border-dashed border-black/10 px-4 py-5 text-sm text-slate-500">No resources yet.</div>`;
        return;
      }

      listBox.innerHTML = items.map((item) => `
        <article class="rounded-2xl border border-black/10 p-4">
          <h3 class="text-base font-semibold">Resource #${item.id}</h3>
          <p class="mt-1 text-sm text-slate-700">${item.name}</p>
          <p class="text-sm text-slate-500">${item.description || "-"}</p>
          <p class="mt-2 text-sm text-slate-600">
            Available: ${item.available ? "Yes" : "No"} |
            Price: ${item.price} / ${item.price_unit}
          </p>
        </article>
      `).join("");
    } catch (error) {
      console.error(error);
      listBox.innerHTML = `<div class="rounded-2xl border border-dashed border-black/10 px-4 py-5 text-sm text-slate-500">Server error while loading resources.</div>`;
    }
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const resourceName = document.getElementById("resourceName").value.trim();
    const resourceDescription = document.getElementById("resourceDescription").value.trim();
    const resourceAvailable = document.getElementById("resourceAvailable").checked;
    const resourcePrice = document.getElementById("resourcePrice").value;
    const resourcePriceUnit = document.getElementById("resourcePriceUnit").value;

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          resourceName,
          resourceDescription,
          resourceAvailable,
          resourcePrice,
          resourcePriceUnit,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        showMessage("error", body?.error || "Failed to create resource.");
        return;
      }

      showMessage("success", "Resource created successfully.");
      form.reset();
      await loadResources();
    } catch (error) {
      console.error(error);
      showMessage("error", "Unable to contact the server.");
    }
  });

  loadResources();
});
