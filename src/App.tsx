/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import { Scenarios } from './pages/Scenarios';
import { ScenarioDetail } from './pages/ScenarioDetail';
import { DataResources } from './pages/DataResources';
import { DataResourceDetail } from './pages/DataResourceDetail';
import { Demands } from './pages/Demands';
import { EcoCooperation } from './pages/EcoCooperation';
import { DocumentCenter } from './pages/DocumentCenter';
import { GovData } from './pages/GovData';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthorizationPlatform, TradingPlatform } from './pages/PlatformIntro';
import { ServicePlatformIdentity } from './pages/ServicePlatformIdentity';
import { TrustedServicePlatform } from './pages/TrustedServicePlatform';
import { ContractCreatePage } from './pages/ContractCreatePage';
import { OperationsManagement } from './pages/OperationsManagement';
import { PortalManagement } from './pages/PortalManagement';
import { AuthProvider } from './context/AuthContext';
import { AccessWizardProvider } from './context/AccessWizardContext';
import { AccessWizardModal } from './components/AccessWizardModal';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AccessWizardProvider>
          <AccessWizardModal />
          <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/service-platform" element={<TrustedServicePlatform />} />
          <Route path="/platform/service" element={<TrustedServicePlatform />} />
          <Route path="/platform/service/identity" element={<TrustedServicePlatform />} />
          <Route path="/sp_web" element={<TrustedServicePlatform />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="gov-data" element={<GovData />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:code" element={<ProductDetail />} />
            <Route path="products/:code/apply" element={<ContractCreatePage />} />
            <Route path="contract/create" element={<ContractCreatePage />} />
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
        </AccessWizardProvider>
      </AuthProvider>
    </HashRouter>
  );
}
