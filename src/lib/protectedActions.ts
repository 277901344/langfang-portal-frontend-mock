const protectedActions = [
  'product-detail',
  'product-apply',
] as const;

export type ProtectedAction = (typeof protectedActions)[number];

interface RouteLike {
  pathname: string;
  search?: string;
  hash?: string;
}

export function isProtectedAction(value: string | null | undefined): value is ProtectedAction {
  return protectedActions.includes(value as ProtectedAction);
}

export function normalizeReturnTo(returnTo: string | null | undefined) {
  if (!returnTo || !returnTo.startsWith('/')) {
    return '/';
  }

  return returnTo;
}

export function buildReturnTo(location: RouteLike) {
  return normalizeReturnTo(`${location.pathname}${location.search ?? ''}${location.hash ?? ''}`);
}

export function buildProtectedLoginPath(returnTo: string, action: ProtectedAction) {
  const params = new URLSearchParams({
    returnTo: normalizeReturnTo(returnTo),
    action,
  });

  return `/auth/login?${params.toString()}`;
}

export function resolveProtectedAction(action: string | null | undefined) {
  if (!isProtectedAction(action)) {
    return null;
  }

  return action;
}

export function resolveProtectedDestination(
  action: ProtectedAction | null,
  fallbackReturnTo: string,
) {
  if (!action) {
    return normalizeReturnTo(fallbackReturnTo);
  }

  switch (action) {
    case 'product-detail':
      return normalizeReturnTo(fallbackReturnTo);
    case 'product-apply':
      return '/docs';
    default:
      return normalizeReturnTo(fallbackReturnTo);
  }
}

export function resolveLoginBackTarget(
  action: ProtectedAction | null,
  fallbackReturnTo: string,
) {
  switch (action) {
    case 'product-detail':
      return '/products';
    default:
      return normalizeReturnTo(fallbackReturnTo);
  }
}
