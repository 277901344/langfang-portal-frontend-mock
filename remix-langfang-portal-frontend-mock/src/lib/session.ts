import type { AuthUser } from './auth';

export const LAST_USERNAME_KEY = 'lf-last-username';
export const AUTH_USER_KEY = 'lf-auth-user';

export type AuthSessionUser = AuthUser;

function hasWindow() {
  return typeof window !== 'undefined';
}

export function readStoredUsername() {
  if (!hasWindow()) {
    return '';
  }

  return window.localStorage.getItem(LAST_USERNAME_KEY) ?? '';
}

export function writeStoredUsername(username: string) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(LAST_USERNAME_KEY, username);
}

export function readStoredUser(): AuthSessionUser | null {
  if (!hasWindow()) {
    return null;
  }

  const storedUser = window.localStorage.getItem(AUTH_USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(storedUser) as AuthSessionUser;
    if (!parsedUser?.username) {
      window.localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
    return parsedUser;
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function writeStoredUser(user: AuthSessionUser) {
  if (!hasWindow()) {
    return;
  }

  if (!user?.username) {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(AUTH_USER_KEY);
}

export function getDisplayName(user: AuthSessionUser | null) {
  if (!user) {
    return '';
  }

  return user.displayName?.trim() || user.username?.trim() || '已登录用户';
}
