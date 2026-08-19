import { Navigate, type RouteObject } from 'react-router-dom';
import {
    MarketplaceHomePage,
    MarketplaceOrderConfirmPage,
    MarketplaceProductDetailPage,
} from '@/modules/marketplace/pages';

export const routes: RouteObject[] = [
    {
        path: '/marketplace',
        element: <MarketplaceHomePage />,
    },
    {
        path: '/marketplace/products',
        element: <Navigate to="/marketplace" replace />,
    },
    {
        path: '/marketplace/products/:id/confirm',
        element: <MarketplaceOrderConfirmPage />,
    },
    {
        path: '/marketplace/products/:id',
        element: <MarketplaceProductDetailPage />,
    },
];
