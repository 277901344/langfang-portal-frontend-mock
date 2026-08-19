import { get } from '@/shared/utils/request';
import type { CurrentAuthzResponse, MenuModule } from '@/shared/types/rbac';

export const getCurrentAuthz = async (): Promise<CurrentAuthzResponse> => {
  return get<CurrentAuthzResponse>('/authz/current/permissions');
};

export const getCurrentMenuModules = async (): Promise<MenuModule[]> => {
  return get<MenuModule[]>('/authz/current/menu-modules');
};
