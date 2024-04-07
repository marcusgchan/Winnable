import { SERVER_URL } from "/src/lib/common/constants.js";

export async function fetchUser() {
  try {
    const response = await fetch(SERVER_URL + "/api/auth/authorize", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    console.log(response);
    return await response.json();
  } catch (err) {
    console.log(err);
    throw err;
  }
  // return fetch(SERVER_URL + "/api/auth/authorize", { credentials: "include" })
  //   .then((res) => {
  //     console.log(res.json());
  //     res.json();
  //   })
  //   .catch((err) => console.log(err));
}

export async function login() {
  return fetch(SERVER_URL + "/api/auth/login")
    .then((res) => {
      res.json();
    })
    .catch((err) => console.log(err));
}
