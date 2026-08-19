export interface User {
    id: number;
    username: string;
    displayName?: string;
    roleId?: number;
    roleIds?: number[];
    accountType?: number; // 1: Unverified, 2: Verified, 3: Sub-account, 4: SP Platform User
    ownerUserId?: number;
    userIdentityCode?: string;
    subjectName?: string;
    authStatus: number; // -1: Unverified, 0: Pending, 1: Verified, 2: Rejected
    authType: number;   // 0: None, 1: Individual, 2: Organization, 3: Operator
    createTime?: string;
    updateTime?: string;
    // Keeping existing optional fields for backward compatibility if used elsewhere
    name?: string;
    avatar?: string;
    role?: string;
    email?: string;
}

export interface UserState {
    token: string | null;
    userInfo: User | null;
}
