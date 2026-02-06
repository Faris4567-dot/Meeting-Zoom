import API from "./api";

export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const logoutUser = (data) => API.post("/auth/logout", data);
