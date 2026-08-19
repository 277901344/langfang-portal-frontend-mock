/**
 * Module IDs used for Permission Control Configuration
 * These IDs correspond to the `sys_module` table in the backend database.
 */
export const MODULE_IDS = {
    MARKETPLACE: {
        ROOT: '01',
        LIST: '0101',
    },
    DEMAND_CENTER: {
        ROOT: '02',
        LIST: '0201',
    },
    BILLING: {
        ROOT: '03',
        LIST: '0301',
    },
    TRADE_ORDER: {
        ROOT: '04',
        LIST: '0401',
    },
} as const;
