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
import { EcoCooperation } from './pages/EcoCooperation';
import { DocumentCenter } from './pages/DocumentCenter';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthorizationPlatform, TradingPlatform } from './pages/PlatformIntro';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:code" element={<ProductDetail />} />
            <Route path="scenarios" element={<Scenarios />} />
            <Route path="scenarios/:id" element={<ScenarioDetail />} />
            <Route path="platform/authorization" element={<AuthorizationPlatform />} />
            <Route path="platform/trading" element={<TradingPlatform />} />
            <Route path="ecology" element={<EcoCooperation />} />
            <Route path="docs" element={<DocumentCenter />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
