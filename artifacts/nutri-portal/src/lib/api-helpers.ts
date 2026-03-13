// Centralized helper to get authentication options for Orval generated hooks
export const getAuthReq = (): RequestInit => {
  const token = localStorage.getItem("auth_token");
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
};

export const getAuthOptions = () => ({
  request: getAuthReq()
});
