const SUPPORTED_IDENTITY_TYPES = ['individual', 'organization', 'operator'] as const;
type SupportedIdentityType = typeof SUPPORTED_IDENTITY_TYPES[number];

type AppConfig = {
    VITE_API_BASE_URL: string;
    VITE_AUTH_TOKEN_KEY: string;
    VITE_SPACE_NAME: string;
    VITE_DISABLED_IDENTITY_TYPES: SupportedIdentityType[];
};

function normalizeDisabledIdentityTypes(
    value: SupportedIdentityType[] | string | undefined
): SupportedIdentityType[] | undefined {
    if (Array.isArray(value)) {
        return value.filter((item): item is SupportedIdentityType =>
            SUPPORTED_IDENTITY_TYPES.includes(item)
        );
    }

    if (typeof value === 'string') {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            return [];
        }

        return trimmedValue
            .split(',')
            .map(item => item.trim())
            .filter((item): item is SupportedIdentityType =>
                SUPPORTED_IDENTITY_TYPES.includes(item as SupportedIdentityType)
            );
    }

    return undefined;
}

declare global {
    interface Window {
        __APP_CONFIG__?: {
            VITE_API_BASE_URL?: string;
            VITE_AUTH_TOKEN_KEY?: string;
            VITE_SPACE_NAME?: string;
            VITE_DISABLED_IDENTITY_TYPES?: SupportedIdentityType[] | string;
        };
    }
}

export const getAppConfig = (): AppConfig => {
    const runtimeConfig = window.__APP_CONFIG__ || {};

    return {
        VITE_API_BASE_URL: runtimeConfig.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/trading/',
        VITE_AUTH_TOKEN_KEY: runtimeConfig.VITE_AUTH_TOKEN_KEY || import.meta.env.VITE_AUTH_TOKEN_KEY || 'prod_trading_token',
        VITE_SPACE_NAME: runtimeConfig.VITE_SPACE_NAME || import.meta.env.VITE_SPACE_NAME || '数据交易平台',
        VITE_DISABLED_IDENTITY_TYPES: normalizeDisabledIdentityTypes(
            runtimeConfig.VITE_DISABLED_IDENTITY_TYPES || import.meta.env.VITE_DISABLED_IDENTITY_TYPES
        ) || []
    };
};
