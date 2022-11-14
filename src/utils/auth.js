export const getHeader = () => {
  const savedToken = getToken();
  return savedToken
    ? { headers: { Authorization: `Bearer ${savedToken}` } }
    : undefined;
};

export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
