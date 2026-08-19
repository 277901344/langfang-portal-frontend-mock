import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import FundAccountPage from '@/modules/fund-account/pages';

export const routes: RouteObject[] = [
    {
        path: 'fund-account',
        element: <FundAccountPage />,
    },
];

export const legacyRoutes: RouteObject[] = [
    {
        path: '/account/fund',
        element: <Navigate to="/console/fund-account" replace />,
    },
];
