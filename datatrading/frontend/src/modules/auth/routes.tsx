import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const LoginPage = lazy(() => import('./pages/Login'));

export const routes: RouteObject[] = [
  {
    path: 'login',
    element: <LoginPage />,
  }
];
