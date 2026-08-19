import type { RouteObject } from 'react-router-dom';
import DemandCenterPage from '@/modules/demand-center/pages';
import CreateDemandPage from '@/modules/demand-center/pages/create';
import EditDemandPage from '@/modules/demand-center/pages/edit';
import DemandDetailPage from '@/modules/demand-center/pages/detail';

export const routes: RouteObject[] = [
    {
        path: '/demand-center',
        element: <DemandCenterPage />,
    },
    {
        path: '/demand-center/create',
        element: <CreateDemandPage />,
    },
    {
        path: '/demand-center/:id/edit',
        element: <EditDemandPage />,
    },
    {
        path: '/demand-center/:id',
        element: <DemandDetailPage />,
    },
];
