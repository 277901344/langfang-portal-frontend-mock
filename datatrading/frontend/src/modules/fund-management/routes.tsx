import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import FundManagementAccountsPage from '@/modules/fund-management/pages';
import FundManagementFlowsPage from '@/modules/fund-management/pages/flows';

export const routes: RouteObject[] = [
    {
        path: 'fund-management',
        element: <Navigate to="/console/fund-management/accounts" replace />,
    },
    {
        path: 'fund-management/accounts',
        element: <FundManagementAccountsPage />,
    },
    {
        path: 'fund-management/flows',
        element: <FundManagementFlowsPage />,
    },
];
