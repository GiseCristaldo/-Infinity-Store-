import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

// --- CORRECCIÓN DE RUTAS DE IMPORTACIÓN ---
import ResponsiveAppBar from '../components/ResponsiveAppBar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import RequireAdmin from '../components/auth/RequireAdmin.jsx';
import RequireAuth from '../components/auth/RequireAuth.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import ChatWidget from '../components/ChatWidget.jsx';

// --- Páginas Públicas ---
import HomePage from '../pages/HomePage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import CartPage from '../pages/CartPage.jsx';
import ProductDetailPage from '../pages/ProductDetailPage.jsx';
import CategoryDetailPage from '../pages/CategoryDetailPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import ProfileEdit from '../pages/ProfileEdit.jsx';
import MyOrders from '../pages/MyOrders.jsx';
import OrdersPage from '../pages/OrdersPage.jsx';
import OrderDetailPage from '../pages/OrderDetailPage.jsx';
import AuthSuccessPage from '../pages/AuthSuccessPage.jsx';
import FaqPage from '../pages/FaqPage.jsx';
import EnviosPage from '../pages/EnviosPage.jsx';
import ContactoPage from '../pages/ContactoPage.jsx';
import PreviewPage from '../pages/PreviewPage.jsx';

// --- Páginas de Administración ---
import AdminLayout from '../pages/admin/AdminLayout.jsx';
import DashboardAdmin from '../pages/admin/DashboardAdmin.jsx';
import DashboardContent from '../pages/admin/DashboardContent.jsx';
import AdminUsers from '../pages/admin/AdminUsers.jsx';
import AdminProducts from '../pages/admin/AdminProducts.jsx';
import AdminCategories from '../pages/admin/AdminCategories.jsx';
import AdminOrders from '../pages/admin/AdminOrders.jsx';

// --- Páginas de Super Administración ---
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard.jsx';
import AdminManagement from '../pages/admin/AdminManagement.jsx';
import ThemeCustomization from '../pages/admin/ThemeCustomization.jsx';
import TypographySettings from '../pages/admin/TypographySettings.jsx';
import ImageManagement from '../pages/admin/ImageManagement.jsx';
import SimpleCarouselManager from '../components/SimpleCarouselManager.jsx';
import BrandingSettings from '../pages/admin/BrandingSettings.jsx';
import ChangeHistory from '../pages/admin/ChangeHistory.jsx';
import RequireSuperAdmin from '../components/auth/RequireSuperAdmin.jsx';

// Layout para las páginas públicas (con Navbar y Footer integrado)
const PublicLayout = () => (
  <>
    <ResponsiveAppBar />
    <Container sx={{ mt: 2, mb: 4, flexGrow: 1 }}>
      {/* Asegurar que cualquier error en el contenido no tumbe la UI */}
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Container>
    {/* Envolver Footer en ErrorBoundary */}
    <ErrorBoundary>
      <Footer />
    </ErrorBoundary>
    <ChatWidget />
  </>
);

// Layout para páginas que requieren autenticación
const AuthenticatedLayout = () => (
  <RequireAuth>
    <ResponsiveAppBar />
    <Container sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      {/* Asegurar que cualquier error en el contenido no tumbe la UI */}
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Container>
    {/* Envolver Footer en ErrorBoundary */}
    <ErrorBoundary>
      <Footer />
    </ErrorBoundary>
    <ChatWidget />
  </RequireAuth>
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
      {/* --- Rutas públicas --- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/success" element={<AuthSuccessPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/category/:id" element={<CategoryDetailPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/envios" element={<EnviosPage />} />
        {/* Envolver Contacto para aislar errores de la página */}
        <Route path="/contacto" element={<ErrorBoundary><ContactoPage /></ErrorBoundary>} />
        {/* Página de vista previa para temas */}
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Route>
      {/* --- Rutas que requieren autenticación --- */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/mis-ordenes" element={<MyOrders />} />
        <Route path="/mis-ordenes/:orderId" element={<OrderDetailPage />} />
      </Route>

      {/* --- Rutas de administración --- */}
      <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route path="/admin" element={<ErrorBoundary><DashboardContent /></ErrorBoundary>} />
        <Route path="/admin/users" element={<ErrorBoundary><AdminUsers /></ErrorBoundary>} />
        <Route path="/admin/products" element={<ErrorBoundary><AdminProducts /></ErrorBoundary>} />
        <Route path="/admin/categories" element={<ErrorBoundary><AdminCategories /></ErrorBoundary>} />
        <Route path="/admin/orders" element={<ErrorBoundary><AdminOrders /></ErrorBoundary>} />
      </Route>

      {/* --- Rutas de super administración --- */}
      <Route element={<RequireSuperAdmin><SuperAdminDashboard /></RequireSuperAdmin>}>
        <Route path="/super-admin" element={<div>Dashboard Overview</div>} />
        <Route path="/super-admin/admins" element={<ErrorBoundary><AdminManagement /></ErrorBoundary>} />
        <Route path="/super-admin/theme" element={<ErrorBoundary><ThemeCustomization /></ErrorBoundary>} />
        <Route path="/super-admin/typography" element={<ErrorBoundary><TypographySettings /></ErrorBoundary>} />
        <Route path="/super-admin/images" element={<ErrorBoundary><SimpleCarouselManager /></ErrorBoundary>} />
        <Route path="/super-admin/branding" element={<ErrorBoundary><BrandingSettings /></ErrorBoundary>} />
        <Route path="/super-admin/history" element={<ErrorBoundary><ChangeHistory /></ErrorBoundary>} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
