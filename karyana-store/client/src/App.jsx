import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';

import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Khata from './pages/Khata';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Purchases from './pages/Purchases';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Expiry from './pages/Expiry';
import Staff from './pages/Staff';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-400">Loading Karyana System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'manager' && user.role !== 'Admin' && user.role !== 'Manager') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="pos" element={<POS />} />
              <Route path="khata" element={<Khata />} />
              <Route path="products" element={<Products />} />
              <Route path="customers" element={<Customers />} />
              <Route
                path="inventory"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="purchases"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <Purchases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="suppliers"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <Suppliers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route path="expiry" element={<Expiry />} />
              <Route
                path="staff"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Staff />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
