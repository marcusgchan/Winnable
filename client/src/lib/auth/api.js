import { SERVER_URL } from "/src/lib/common/constants.js";

export async function fetchUser() {
  return fetch(SERVER_URL + "/api/auth/authorize", { credentials: "include" })
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

export async function login() {
  return fetch(SERVER_URL + "/api/auth/login")
    .then((res) => res.json())
    .catch((err) => console.log(err));
}
