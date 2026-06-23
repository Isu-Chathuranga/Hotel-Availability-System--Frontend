// src/api.js
// Talks to the PHP backend. Update BASE_URL if your backend lives somewhere else.

const BASE_URL = "http://localhost:8000/api";

async function request(path, body) {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    credentials: "include", // sends/receives the PHP session cookie
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export function loginUser({ email, password }) {
  return request("login.php", { email, password });
}

export function registerUser({ fullName, email, password }) {
  return request("register.php", { fullName, email, password });
}

export function logoutUser() {
  return request("logout.php", {});
}
