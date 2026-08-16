/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { AccessWizardProvider } from './context/AccessWizardContext';
import { AccessWizardModal } from './components/AccessWizardModal';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Products = lazy(() => import('./pages/Products').then((module) => ({ default: module.Products })));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Scenarios = lazy(() => import('./pages/Scenarios').then((module) => ({ default: module.Scenarios })));
const ScenarioDetail = lazy(() => import('./pages/ScenarioDetail').then((module) => ({ default: module.ScenarioDetail })));
const DataResources = lazy(() => import('./pages/DataResources').then((module) => ({ default: module.DataResources })));
const DataResourceDetail = lazy(() => import('./pages/DataResourceDetail').then((module) => ({ default: module.DataResourceDetail })));
const Demands = lazy(() => import('./pages/Demands').then((module) => ({ default: module.Demands })));
const EcoCooperation = lazy(() => import('./pages/EcoCooperation').then((module) => ({ default: module.EcoCooperation })));
const DocumentCenter = lazy(() => import('./pages/DocumentCenter').then((module) => ({ default: module.DocumentCenter })));
const GovData = lazy(() => import('./pages/GovData').then((module) => ({ default: module.GovData })));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AuthorizationPlatform = lazy(() => import('./pages/PlatformIntro').then((module) => ({ default: module.AuthorizationPlatform })));
const TradingPlatform = lazy(() => import('./pages/PlatformIntro').then((module) => ({ default: module.TradingPlatform })));
const ServicePlatformIdentity = lazy(() => import('./pages/ServicePlatformIdentity').then((module) => ({ default: module.ServicePlatformIdentity })));
const ContractCreatePage = lazy(() => import('./pages/ContractCreatePage').then((module) => ({ default: module.ContractCreatePage })));
const PortalManagement = lazy(() => import('./pages/PortalManagement').then((module) => ({ default: module.PortalManagement })));

function RouteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[320px] w-full items-center justify-center bg-slate-50 text-sm font-medium text-slate-500"
    >
      页面加载中...
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AccessWizardProvider>
          <AccessWizardModal />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/platform/service/identity" element={<ServicePlatformIdentity />} />
              <Route path="/platform/service" element={<ServicePlatformIdentity />} />
              <Route path="/sp_web" element={<ServicePlatformIdentity />} />
              <Route path="/products/:code/apply" element={<ContractCreatePage />} />
              <Route path="/contract/create" element={<ContractCreatePage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="gov-data" element={<GovData />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:code" element={<ProductDetail />} />
                <Route path="data-resources" element={<DataResources />} />
                <Route path="data-resources/:id" element={<DataResourceDetail />} />
                <Route path="demands" element={<Demands />} />
                <Route path="scenarios" element={<Scenarios />} />
                <Route path="scenarios/:id" element={<ScenarioDetail />} />
                <Route path="platform/authorization" element={<AuthorizationPlatform />} />
                <Route path="platform/trading" element={<TradingPlatform />} />
                <Route path="platform/service/identity" element={<ServicePlatformIdentity />} />
                <Route path="ecology" element={<EcoCooperation />} />
                <Route path="eco-cooperation" element={<EcoCooperation />} />
                <Route path="open-ecology" element={<EcoCooperation />} />
                <Route path="dev-ecology" element={<EcoCooperation />} />
                <Route path="eco" element={<EcoCooperation />} />
                <Route path="operations" element={<PortalManagement />} />
                <Route path="portal-management" element={<PortalManagement />} />
                <Route path="docs" element={<DocumentCenter />} />
                <Route path="documents" element={<DocumentCenter />} />
                <Route path="document-center" element={<DocumentCenter />} />
              </Route>
            </Routes>
          </Suspense>
        </AccessWizardProvider>
      </AuthProvider>
    </HashRouter>
  );
}
