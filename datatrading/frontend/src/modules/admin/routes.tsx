import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import BillingPage from '@/modules/billing/pages';
import UsagePage from '@/modules/billing/pages/usage';
import { routes as fundManagementRoutes } from '@/modules/fund-management/routes';
import { routes as fundAccountRoutes } from '@/modules/fund-account/routes';
import { routes as commodityManagementRoutes } from '@/modules/commodity-management/routes';
import TradeOrderPage from '@/modules/trade-order/pages';
import TradeOrderDetailPage from '@/modules/trade-order/pages/detail';

export const routes: RouteObject[] = [
    {
        index: true,
        element: <Navigate to="/console/commodity-management" replace />,
    },
    ...fundManagementRoutes,
    ...fundAccountRoutes,
    ...commodityManagementRoutes,
    {
        path: 'billing',
        element: <BillingPage />,
    },
    {
        path: 'billing/usage',
        element: <UsagePage />,
    },
    {
        path: 'trade-order',
        element: <TradeOrderPage />,
    },
    {
        path: 'trade-order/:orderId',
        element: <TradeOrderDetailPage />,
    },
];
