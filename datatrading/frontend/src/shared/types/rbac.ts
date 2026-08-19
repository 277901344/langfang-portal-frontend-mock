export interface MenuModule {
  id: number;
  moduleId: string;
  moduleName: string;
  parentModuleId?: string;
  routePath?: string;
  sortOrder?: number;
  status?: string;
  isGoverned?: boolean;
}

export interface CurrentAuthzResponse {
  permissions: string[];
  roleCodes: string[];
  menuModules: MenuModule[];
  accountType?: number;
  userIdentityCode?: string;
  subjectName?: string;
}

export interface RoleItem {
  id: number;
  roleCode: string;
  roleName: string;
  roleLevel: number;
  isBuiltin: boolean;
  status: string;
}
