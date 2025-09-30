// src/components/ResponsiveAppBar.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Badge, // <-- Importa Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import GroupIcon from '@mui/icons-material/Group';

import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx'; // <-- Importa el hook useCart
import { useAuth } from '../context/AuthContext.jsx'; // Importa useAuth

// Definición de las páginas principales (para el centro en desktop y móvil)
const mainPages = [
  { name: 'Inicio', path: '/', icon: <HomeIcon /> },
  { name: 'Productos', path: '/products', icon: <StorefrontIcon /> },
];

// Definición de las opciones de usuario y autenticación (para el Drawer móvil)
const authAndUserPagesDrawer = [
  // Cambiado '/auth' a '/login' para ser consistente con App.jsx
  { name: 'Login / Registro', path: '/auth', icon: <PersonIcon />, needsAuth: false, isCombinedAuth: true },
  // Añadida propiedad isCartButton para identificarlo y manejarlo con Badge
  { name: 'Carrito', path: '/cart', icon: <ShoppingCartIcon />, needsAuth: false, isCartButton: true },
  { name: 'Perfil', path: '/profile', icon: <PersonIcon />, needsAuth: true },


  { name: 'Cerrar Sesión', path: '/logout', icon: <LogoutIcon />, needsAuth: true, isLogout: true },
];

// Definición de las opciones de administración
const adminPages = [
  { name: 'Dashboard Admin', path: '/admin', icon: <DashboardIcon />, requiresAdmin: true },
  { name: 'Gestionar Productos', path: '/admin/products', icon: <StorefrontIcon />, requiresAdmin: true },
  // Eliminada ruta de categorías de admin si no se va a usar un CRUD de categorías
  // { name: 'Gestionar Categorías', path: '/admin/categories', icon: <CategoryIcon />, requiresAdmin: true },
  { name: 'Gestionar Órdenes', path: '/admin/orders', icon: <ShoppingBasketIcon />, requiresAdmin: true },
  { name: 'Gestionar Usuarios', path: '/admin/users', icon: <GroupIcon />, requiresAdmin: true },
];

function ResponsiveAppBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const { getTotalItemsInCart } = useCart(); // Usa el hook para obtener la cantidad total
  const { isAuthenticated, user, logout } = useAuth(); // Obtiene el estado de autenticación y el usuario del AuthContext

  // Determinar si el usuario es administrador
  const isAdminUser = isAuthenticated && user?.rol === 'admin';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuItemClick = async (path) => {
    handleDrawerToggle();
    // Si la ruta es '/logout', llamamos a la función de logout del contexto
    if (path === '/logout') {
      try {
        await logout();
        localStorage.removeItem('token'); // Eliminar el token del almacenamiento local
        localStorage.removeItem('user'); // Eliminar los datos del usuario del almacenamiento local
        navigate('/auth'); // Redirigir al login después de cerrar sesión
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    } else {
      navigate(path);
    }
  };

  // Contenido del Drawer (menú lateral para móvil)
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', bgcolor: 'primary.dark', color: 'text.primary', height: '100%' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Infinity Store
      </Typography>
        {/* Mostrar nombre de usuario en el drawer si está autenticado */}
        {isAuthenticated && (
          <ListItem disablePadding>
            <ListItemText primary={`Hola, ${user?.nombre || 'Usuario'}`} sx={{ textAlign: 'center', color: 'text.secondary', my: 1, px: 2 }} />
          </ListItem>
        )}
      <List>
        {/* Páginas principales para móvil */}
        {mainPages.map((page) => (
          <ListItem key={page.name} disablePadding>
            <ListItemButton component={Link} to={page.path} onClick={() => handleMenuItemClick(page.path)} sx={{ textAlign: 'left' }}>
              <ListItemIcon sx={{ color: 'text.primary' }}>{page.icon}</ListItemIcon>
              <ListItemText primary={page.name} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Opciones de autenticación y usuario para móvil */}
        {authAndUserPagesDrawer.map((page) => {
          if (page.isCombinedAuth) {
            // Mostrar "Login / Registro" solo si no está autenticado
            return !isAuthenticated && (
              <ListItem key={page.name} disablePadding>
                <ListItemButton component={Link} to={page.path} onClick={() => handleMenuItemClick(page.path)} sx={{ textAlign: 'left' }}>
                  <ListItemIcon sx={{ color: 'text.primary' }}>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.name} />
                </ListItemButton>
              </ListItem>
            );
          } else if (page.isCartButton) {
              // Mostrar Carrito siempre, con Badge
              return (
                <ListItem key={page.name} disablePadding>
                  <ListItemButton component={Link} to={page.path} onClick={() => handleMenuItemClick(page.path)} sx={{ textAlign: 'left' }}>
                    <ListItemIcon sx={{ color: 'text.primary' }}>
                      <Badge badgeContent={getTotalItemsInCart()} color="secondary">
                        {page.icon}
                      </Badge>
                    </ListItemIcon>
                    {/* Texto del carrito con la cantidad actual */}
                    <ListItemText primary={`Carrito (${getTotalItemsInCart()})`} />
                  </ListItemButton>
                </ListItem>
              );
          } else if (page.isLogout) {
            // Mostrar "Cerrar Sesión" solo si está autenticado
            return isAuthenticated && (
              <ListItem key={page.name} disablePadding>
                <ListItemButton onClick={() => handleMenuItemClick('/logout')} sx={{ textAlign: 'left' }}>
                  <ListItemIcon sx={{ color: 'text.primary' }}>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.name} />
                </ListItemButton>
              </ListItem>
            );
          } else {
            // Mostrar otras páginas de usuario (ej. Perfil, Mis Órdenes) solo si está autenticado y necesita autenticación
            return isAuthenticated && page.needsAuth && (
              <ListItem key={page.name} disablePadding>
                <ListItemButton component={Link} to={page.path} onClick={() => handleMenuItemClick(page.path)} sx={{ textAlign: 'left' }}>
                  <ListItemIcon sx={{ color: 'text.primary' }}>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.name} />
                </ListItemButton>
              </ListItem>
            );
          }
        })}
      

        {/* Opciones de administración para móvil (solo si es admin) */}
        {isAdminUser && (
          <>
            <Typography variant="caption" sx={{ mt: 2, mb: 1, display: 'block', color: 'text.secondary', pl: 2 }}>
              Administración
            </Typography>
            {adminPages.map((page) => (
              <ListItem key={page.name} disablePadding>
                <ListItemButton component={Link} to={page.path} onClick={() => handleMenuItemClick(page.path)} sx={{ textAlign: 'left' }}>
                  <ListItemIcon sx={{ color: 'text.primary' }}>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" sx={{ backgroundColor: 'primary.main', borderRadius: 0 }}>
      <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Sección Izquierda: Logo/Título */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Typography variant="h6" component="div">
            <Link to="/" style={{ textDecoration: 'none', color: theme.palette.primary.contrastText }}>
              Infinity Store 🚀
            </Link>
          </Typography>
        </Box>

        {/* Sección Central: Botones de Navegación (solo en escritorio) */}
        {isDesktop && (
          <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}>
            {mainPages.map((page) => (
              <Button
                key={page.name}
                color="inherit"
                component={Link}
                to={page.path}
                startIcon={page.icon}
                sx={{ mx: 1.5, '&:hover': { backgroundColor: 'primary.light' } }}
              >
                {page.name}
              </Button>
            ))}
          </Box>
        )}

        {/* Sección Derecha: Iconos de Usuario/Carrito (visible en ambos, con responsive) */}
        <Box sx={{ display: 'flex', flexShrink: 0, ml: isDesktop ? 2 : 'auto' }}>
          {isDesktop ? (
            // Iconos en escritorio
            <>
              {/* Botón combinado de Autenticación (Login/Registro) */}
              {!isAuthenticated && (
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/auth" // Ajustado a /login
                  title="Login / Registro"
                  sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
                >
                  <PersonIcon />
                </IconButton>
              )}
              {/* Botón de Carrito con Badge */}
              <IconButton
                  color="inherit"
                  component={Link}
                  to="/cart"
                  title="Carrito"
                  sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
              >
                <Badge badgeContent={getTotalItemsInCart()} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              {/* Otros iconos para usuario autenticado, si aplica */}
              {isAuthenticated && (
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/profile"
                  title="Mi Perfil"
                  sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
                >
                  <PersonIcon />
                </IconButton>
              )}
              {isAuthenticated && isAdminUser && (
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/admin"
                  title="Panel de Admin"
                  sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
                >
                  <DashboardIcon />
                </IconButton>
              )}
              {isAuthenticated && (
                <IconButton
                  color="inherit"
                  onClick={() => handleMenuItemClick('/logout')}
                  title="Cerrar Sesión"
                  sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
                >
                  <LogoutIcon />
                </IconButton>
              )}
            </>
          ) : (
            // Icono de menú de hamburguesa para móvil
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {/* Drawer para el menú móvil */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' }, // Mostrar solo en móvil
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, backgroundColor: 'primary.dark' },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}

export default ResponsiveAppBar;