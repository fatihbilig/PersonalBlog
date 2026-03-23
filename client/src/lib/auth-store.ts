import { getToken } from "./api";

const EVENT_NAME = "auth-token-change";

export function notifyAuthTokenChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function subscribeAuthToken(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onEvent = () => callback();
  window.addEventListener(EVENT_NAME, onEvent);
  window.addEventListener("storage", onEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, onEvent);
    window.removeEventListener("storage", onEvent);
  };
}

export function getAuthSnapshot() {
  return getToken();
}

