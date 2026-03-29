function getToken() {
  return localStorage.getItem("token");
}

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function hasToken() {
  return Boolean(getToken());
}

export function getUserRole() {
  const token = getToken();
  if (!token) return null;

  const payload = parseJwt(token);
  return payload?.role || null;
}

export function requireAuthOrBlockPage() {
  const token = getToken();
  if (!token) {
    window.location.href = "/login";
    return false;
  }
  return true;
}

export function logout() {
  localStorage.removeItem("token");
  document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
  window.location.href = "/";
}

export function initAuthUI() {
  const isLoggedIn = hasToken();

  document.querySelectorAll('[data-auth="guest"]').forEach((element) => {
    element.classList.toggle("hidden", isLoggedIn);
  });

  document.querySelectorAll('[data-auth="user"]').forEach((element) => {
    element.classList.toggle("hidden", !isLoggedIn);
  });
}

export function updateHomePageUI() {
  initAuthUI();

  const badge = document.getElementById("userStateBadge");
  if (badge) {
    badge.textContent = hasToken() ? "Signed in" : "Guest";
  }
}
