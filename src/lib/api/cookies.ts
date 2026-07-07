export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // matches the backend's access-token expiry (900000ms)
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // matches the backend's refresh-token expiry (604800000ms)
