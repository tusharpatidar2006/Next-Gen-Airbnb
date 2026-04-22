declare const process: {
  env: {
    NEXT_PUBLIC_API_BASE_URL?: string;
    NEXT_PUBLIC_GEOAPIFY_API_KEY?: string;
  };
};

const configuredApiBase =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined)?.replace(/\/+$/u, '');

const fallbackApiBase = 'http://localhost:4001';

export function getApiBaseUrl() {
  return configuredApiBase || fallbackApiBase;
}

export function buildApiUrl(path: string) {
  return `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

export function hasUsableGeoapifyKey() {
  const key = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY : undefined;
  return Boolean(key && key !== 'api_key_ur_geoapify');
}

export function getGeoapifyApiKey() {
  return hasUsableGeoapifyKey() ? process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY : undefined;
}
