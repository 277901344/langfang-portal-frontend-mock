const normalizePlatformUrl = (value: string | undefined, fallback: string) => {
  const normalized = value?.trim();
  return normalized || fallback;
};

export const platformLinks = {
  service: normalizePlatformUrl(
    import.meta.env.VITE_SERVICE_PLATFORM_URL,
    '/sp_web/#/login',
  ),
  authorization: normalizePlatformUrl(
    import.meta.env.VITE_AUTHORIZATION_PLATFORM_URL,
    '/data-authorization_web/#/login',
  ),
  trading: normalizePlatformUrl(
    import.meta.env.VITE_TRADING_PLATFORM_URL,
    '/trading_web/#/',
  ),
} as const;
