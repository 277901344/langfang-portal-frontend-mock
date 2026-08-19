import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { User } from '@/shared/types/user';
import type { MenuModule } from '@/shared/types/rbac';

interface UserState {
    token: string | null;
    userInfo: User | null;
    permissions: string[];
    roleCodes: string[];
    menuModules: MenuModule[];
    authzLoaded: boolean;
    setToken: (token: string) => void;
    setUserInfo: (info: User | null) => void;
    setAuthz: (permissions: string[], menuModules: MenuModule[], roleCodes?: string[]) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            token: null,
            userInfo: null,
            permissions: [],
            roleCodes: [],
            menuModules: [],
            authzLoaded: false,
            setToken: (token) => set({ token }),
            setUserInfo: (userInfo) => set({ userInfo }),
            setAuthz: (permissions, menuModules, roleCodes = []) => set({ permissions, menuModules, roleCodes, authzLoaded: true }),
            logout: () => set({ token: null, userInfo: null, permissions: [], roleCodes: [], menuModules: [], authzLoaded: false }),
        }),
        {
            name: 'trading-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
