export const onlyEssentialsArguments = [
  "consent",
  "default",
  {
    ad_storage: "denied",
    analytics_storage: "denied",
  },
];

export const onlyAnalyticsArguments = [
  "consent",
  "default",
  {
    ad_storage: "denied",
    analytics_storage: "granted",
  },
];

export const onlyAdvertisingArguments = [
  "consent",
  "default",
  {
    ad_storage: "granted",
    analytics_storage: "denied",
  },
];

export const bothArguments = [
  "consent",
  "default",
  {
    ad_storage: "granted",
    analytics_storage: "granted",
  },
];
