import type { RouteObject } from 'react-router-dom';
import { Navigate, useParams } from 'react-router-dom';

const TradeOrderLegacyRedirect = () => {
    const { orderId } = useParams<{ orderId: string }>();

    return (
        <Navigate
            to={orderId ? `/console/trade-order/${orderId}` : '/console/trade-order'}
            replace
        />
    );
};

export const routes: RouteObject[] = [
    {
        path: '/trade-order',
        element: <TradeOrderLegacyRedirect />,
    },
    {
        path: '/trade-order/:orderId',
        element: <TradeOrderLegacyRedirect />,
    },
];
