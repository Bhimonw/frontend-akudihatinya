// Simple environment validation helper
export function validateEnvironment() {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) {
    // eslint-disable-next-line no-console
    console.error('[ENV ERROR] VITE_API_BASE_URL is not defined. Set it in .env or .env.production');
    return false;
  }
  if (!/^https?:\/\//.test(base)) {
    console.warn('[ENV WARNING] VITE_API_BASE_URL should start with http:// or https://');
  }
  return true;
}

if (import.meta.env.DEV) {
  validateEnvironment();
}
