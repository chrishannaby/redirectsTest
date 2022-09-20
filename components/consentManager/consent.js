import {
  getCookie,
  setConsentCookie,
  setCookie,
  setLocalStorage,
  setConsentv2,
} from "./cookies";
// export const name = "ria-consent";
export const name = "track-consent";

export const getConsent = () => {
  return getCookie(name) == null
    ? typeof window !== "undefined"
      ? window.sessionStorage.getItem(name)
      : false
    : getCookie(name);
};

export const setConsent = (data) => {
  setLocalStorage(name, data);
  setConsentv2(name, data);
  // setConsentCookie(analytics, marketing);
};

export const cancel = () => {
  if (typeof window !== "undefined") window.sessionStorage.setItem(name, false);
};

export const accept = () => {
  setCookie(name, true);
  if (typeof window !== "undefined") window.location.reload(false);
};
