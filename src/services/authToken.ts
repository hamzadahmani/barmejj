let accessToken: string | null = null;
let refreshToken: string | null = null;
const sessionExpiredListeners = new Set<() => void>();

export const setAccessToken = (token?: string | null) => {
  accessToken = token || null;
};

export const getAccessToken = () => accessToken;
export const setRefreshToken = (token?: string | null) => { refreshToken = token || null; };
export const getRefreshToken = () => refreshToken;
export const subscribeToSessionExpiration = (listener: () => void) => {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
};
export const expireSession = () => {
  accessToken = null;
  refreshToken = null;
  sessionExpiredListeners.forEach(listener => listener());
};
