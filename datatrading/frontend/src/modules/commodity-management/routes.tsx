import type { RouteObject } from 'react-router-dom';

import CommodityManagementPage from '@/modules/commodity-management/pages';
import CommodityManagementFormPage from '@/modules/commodity-management/pages/form';

export const routes: RouteObject[] = [
    {
        path: 'commodity-management',
        element: <CommodityManagementPage />,
    },
    {
        path: 'commodity-management/create',
        element: <CommodityManagementFormPage />,
    },
    {
        path: 'commodity-management/edit/:commodityId',
        element: <CommodityManagementFormPage />,
    },
    {
        path: 'commodity-management/view/:commodityId',
        element: <CommodityManagementFormPage />,
    },
];
