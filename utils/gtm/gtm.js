import {
  onlyEssentialsArguments,
  bothArguments,
  onlyAnalyticsArguments,
  onlyAdvertisingArguments,
} from "./constants";
import { gdprCountryCodes } from "../gdprCountryCodes";

const scriptLoaded = () => {
  const allScripts = document.head.getElementsByTagName("script");
  for (let i = 0; i < allScripts.length; i++) {
    if (String(allScripts[i].src).includes("www.googletagmanager.com")) {
      return true;
    }
  }
  return false;
};

export const loadGtmIfCookieExists = (consentLocale) => {
  if (typeof window !== "undefined") {
    const cookie = JSON.parse(window.localStorage.getItem("track-consent"));
    if (cookie && !scriptLoaded()) {
      initGoogleTagManager(cookie, null, consentLocale);
    }
  }
};

const defineConsents = (cookie, state, consentLocale) => {
  if (!gdprCountryCodes.includes(consentLocale.split("-")[1])) {
    return {
      analytics: true,
      marketing: true,
    };
  } else {
    return {
      analytics: cookie ? cookie.analytics : state.analytics,
      marketing: cookie ? cookie.advertising : state.advertising,
    };
  }
};

const loadArgumentsOnGTag = (analyticsConsent, marketingConsent) => {
  if (!analyticsConsent && !marketingConsent) {
    window.gtag(...onlyEssentialsArguments);
  } else if (analyticsConsent && marketingConsent) {
    window.gtag(...bothArguments);
  } else if (analyticsConsent && !marketingConsent) {
    window.gtag(...onlyAnalyticsArguments);
  } else if (!analyticsConsent && marketingConsent) {
    window.gtag(...onlyAdvertisingArguments);
  }
};

export async function initGoogleTagManager(cookie, state, consentLocale) {
  if (typeof window !== "undefined" && !scriptLoaded()) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    let consents = defineConsents(cookie, state, consentLocale);
    loadArgumentsOnGTag(consents["analytics"], consents["marketing"]);

    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
      userID: "",
      locale: consentLocale,
    });

    const url = "https://www.googletagmanager.com/gtm.js?id=GTM-PWH67XF";
    await loadScript(url);
  }
}

export async function loadScript(url) {
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.defer = true;
    script.src = url;
    script.onload = () => {
      resolve(script);
    };
    script.onerror = (err) => {
      reject(err);
    };
    document.head.appendChild(script);
  });
  return promise;
}
