const ACCESS = "zoom_access_token";
const REFRESH = "zoom_refresh_token";

export const saveTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem(ACCESS, access);
  if (refresh) localStorage.setItem(REFRESH, refresh);
};

export const getToken = () => localStorage.getItem(ACCESS);
export const getRefresh = () => localStorage.getItem(REFRESH);

export const clearTokens = () => {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
};
