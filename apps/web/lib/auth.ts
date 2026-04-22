export type AuthPayload = {
  name?: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  token?: string;
};

import { buildApiUrl } from './api';

const AUTH_TOKEN_KEY = 'nwxt_token';
const AUTH_USER_KEY = 'nwxt_user';

async function postJson<T>(url: string, payload: object): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export function getAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export async function loginUser(payload: AuthPayload) {
  return postJson<AuthResponse>(buildApiUrl('/login'), payload);
}

export async function registerUser(payload: AuthPayload) {
  return postJson<AuthResponse>(buildApiUrl('/register'), payload);
}

export async function fetchProfile() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No auth token available');
  }

  const response = await fetch(buildApiUrl('/profile'), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Profile fetch failed with status ${response.status}`);
  }

  return response.json();
}
