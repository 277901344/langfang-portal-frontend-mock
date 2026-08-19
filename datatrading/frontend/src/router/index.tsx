import { lazy, Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

import AdminLayout from '@/layouts/AdminLayout';
import BasicLayout from '@/layouts/BasicLayout';
import BlankLayout from '@/layouts/BlankLayout';
import { routes as authRoutes } from '@/modules/auth/routes';
import { routes as adminRoutes } from '@/modules/admin/routes';
import { routes as billingRoutes } from '@/modules/billing/routes';
import { routes as demandCenterRoutes } from '@/modules/demand-center/routes';
import { legacyRoutes as fundAccountLegacyRoutes } from '@/modules/fund-account/routes';
import { routes as marketplaceRoutes } from '@/modules/marketplace/routes';
import { routes as tradeOrderRoutes } from '@/modules/trade-order/routes';
import AuthGuard from './AuthGuard';

const NotFound = lazy(() => import('@/modules/common/pages'));

const PageLoading = (
    <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
    </div>
);

export const router = createHashRouter([
    {
        path: '/',
        element: (
            <AuthGuard>
                <BasicLayout />
            </AuthGuard>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/marketplace" replace />,
            },
            ...marketplaceRoutes,
            ...demandCenterRoutes,
            ...billingRoutes,
            ...tradeOrderRoutes,
            ...fundAccountLegacyRoutes,
        ],
    },
    {
        path: '/console',
        element: (
            <AuthGuard>
                <AdminLayout />
            </AuthGuard>
        ),
        children: adminRoutes,
    },
    {
        path: '/',
        element: <BlankLayout />,
        children: [
            ...authRoutes,
            {
                path: '*',
                element: (
                    <Suspense fallback={PageLoading}>
                        <NotFound />
                    </Suspense>
                ),
            },
        ],
    },
]);
