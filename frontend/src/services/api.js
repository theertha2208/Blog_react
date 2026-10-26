
const API_BASE = "http://127.0.0.1:8000";

// GET COOKIE VALUE
function getCookie(name) {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(value.join("="));
    }
  }

  return "";
}

// INITIALIZE DJANGO CSRF
export async function initializeCsrf() {
  const response = await fetch(
    `${API_BASE}/api/auth/csrf/`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to initialize CSRF protection (${response.status}).`
    );
  }

  return response;
}

// FORMAT API ERRORS
function getErrorMessage(data, status) {
  if (!data || typeof data !== "object") {
    return `Request failed (${status})`;
  }

  // STANDARD DJANGO REST FRAMEWORK ERRORS
  for (const field of ["detail", "error", "message"]) {
    if (typeof data[field] === "string") {
      return data[field];
    }
  }

  // FIELD VALIDATION ERRORS
  const messages = [];

  for (const [field, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      messages.push(
        `${field}: ${value.join(" ")}`
      );
    } else if (typeof value === "string") {
      messages.push(`${field}: ${value}`);
    }
  }

  return messages.length > 0
    ? messages.join(" | ")
    : `Request failed (${status})`;
}

// MAIN API REQUEST FUNCTION
export async function apiRequest(
  endpoint,
  options = {}
) {
  const method = (
    options.method || "GET"
  ).toUpperCase();

  const headers = new Headers(options.headers || {});

  const isFormData = options.body instanceof FormData;

  // SET JSON CONTENT TYPE
  if (
    options.body != null &&
    !isFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  // ADD CSRF TOKEN TO WRITE REQUESTS
  if (
    !["GET", "HEAD", "OPTIONS"].includes(method)
  ) {
    const csrfToken = getCookie("csrftoken");

    if (!csrfToken) {
      throw new Error(
        "CSRF token missing. Please refresh the page and try again."
      );
    }

    headers.set("X-CSRFToken", csrfToken);
  }

  // SEND REQUEST
  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      method,
      headers,
      credentials: "include",
    }
  );

  // PARSE RESPONSE
  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  }

  // HANDLE API ERRORS
  if (!response.ok) {
    const error = new Error(
      getErrorMessage(data, response.status)
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}
