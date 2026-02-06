import API from "./api";

export const createMeeting = (data) => API.post("/meetings", data);
export const getMeetings = () => API.get("/meetings");
export const getMeeting = (id) => API.get(`/meetings/${id}`);
