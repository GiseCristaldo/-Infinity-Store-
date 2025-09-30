import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

// --- CORRECCIÓN DE RUTAS DE IMPORTACIÓN ---
import ResponsiveAppBar from '../components/ResponsiveAppBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import RequireAdmin from '../components/auth/RequireAdmin.jsx';

// --- Páginas Públicas ---
import HomePage from '../pages/HomePage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import CartPage from '../pages/CartPage.jsx';
import ProductDetailPage from '../pages/ProductDetailPage.jsx';
import CategoryDetailPage from '../pages/CategoryDetailPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import OrdersPage from '../pages/OrdersPage.jsx';
import OrderDetailPage from '../pages/OrderDetailPage.jsx';

// --- Páginas de Administración ---
import AdminLayout from '../pages/admin/AdminLayout.jsx';
import DashboardAdmin from '../pages/admin/DashboardAdmin.jsx';
import DashboardContent from '../pages/admin/DashboardContent.jsx';
import AdminUsers from '../pages/admin/AdminUsers.jsx';
import AdminProducts from '../pages/admin/AdminProducts.jsx';
import AdminCategories from '../pages/admin/AdminCategories.jsx';
import AdminOrders from '../pages/admin/AdminOrders.jsx';

// Layout para las páginas públicas (con Navbar y Footer integrado)
const PublicLayout = () => (
  <>
    <ResponsiveAppBar />
    <Container sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      <Outlet />
    </Container>
    <Box component="footer" sx={{ p: 2, mt: 'auto', backgroundColor: 'primary.dark', color: 'white', textAlign: 'center' }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} Infinity Store. Todos los derechos reservados.
      </Typography>
    </Box>
  </>
);

function AppRoutes() {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Verificando sesión...</Typography>
      </Box>
    );
  }

  return (
    <Routes>
      {/* --- Rutas públicas que usarán el layout de arriba --- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/mis-ordenes" element={<OrdersPage />} />
        <Route path="/mis-ordenes/:orderId" element={<OrderDetailPage />} />
        <Route path="/category/:id" element={<CategoryDetailPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Route>

      {/* --- Rutas de Administración (quedan separadas y con su propio layout) --- */}
      <Route 
        path="/admin" 
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<DashboardContent />} />
        <Route path="dashboard" element={<DashboardContent />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
