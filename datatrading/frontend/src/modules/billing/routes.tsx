import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

export const routes: RouteObject[] = [
    {
        path: '/billing',
        element: <Navigate to="/console/billing" replace />,
    },
    {
        path: '/billing/usage',
        element: <Navigate to="/console/billing/usage" replace />,
    },
];
