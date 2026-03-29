const form = document.getElementById("loginForm");
const messageBox = document.getElementById("message");

function showMessage(type, text) {
  if (!messageBox) return;

  const styles = {
    success: "border-green-300 bg-green-50 text-green-700",
    error: "border-rose-300 bg-rose-50 text-rose-700",
    info: "border-blue-300 bg-blue-50 text-blue-700",
  };

  messageBox.className = `rounded-2xl border px-4 py-3 text-sm ${styles[type] || styles.info}`;
  messageBox.textContent = text;
  messageBox.classList.remove("hidden");
}

function hideMessage() {
  if (!messageBox) return;
  messageBox.className = "hidden";
  messageBox.textContent = "";
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const body = await response.json();

    if (!response.ok) {
      showMessage("error", body?.error || body?.message || "Login failed.");
      return;
    }

    const successMessage = body?.message || "Sign-in successful. Redirecting...";
    showMessage("success", successMessage);

    localStorage.setItem("token", body.token);
    document.cookie = `token=${encodeURIComponent(body.token)}; Path=/; SameSite=Lax`;

    const redirectTo =
      body?.redirectTo ||
      form.getAttribute("data-success-redirect") ||
      "/";

    window.setTimeout(() => {
      window.location.href = redirectTo;
    }, 700);
  } catch (error) {
    console.error("Login failed:", error);
    showMessage("error", "Unable to contact the server.");
  }
});
