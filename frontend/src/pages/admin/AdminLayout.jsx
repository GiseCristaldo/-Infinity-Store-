import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Tooltip, IconButton
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles'; // Importar createTheme

// --- Iconos ---
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';

// --- TEMA ESPECÍFICO PARA EL PANEL DE ADMINISTRACIÓN ---
// Definimos el tema aquí para mantenerlo separado del tema principal de la tienda.
const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#7e57c2', // Morado claro y sobrio
    },
    background: {
      default: '#ffffff', // Fondo principal blanco
    },
    text: {
      primary: '#212121', // Texto principal oscuro
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 600, fontSize: '1.5rem' },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f5f5f5', // Fondo gris claro para encabezados de tabla
          fontWeight: 700,
          color: '#212121',
        },
      },
    },
  },
});

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', path: '/admin', icon: <DashboardIcon />, tooltip: 'Ver el inicio del dashboard' },
  { text: 'Usuarios', path: '/admin/users', icon: <PeopleIcon />, tooltip: 'Gestionar usuarios' },
  { text: 'Categorías', path: '/admin/categories', icon: <CategoryIcon />, tooltip: 'Gestionar categorías' },
  { text: 'Órdenes', path: '/admin/orders', icon: <CategoryIcon />, tooltip: 'Gestionar órdenes' },
  { text: 'Productos', path: '/admin/products', icon: <CategoryIcon />, tooltip: 'Gestionar productos' }  // Nuevo ítem para productos
];

function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate(); 
    const { logout } = useAuth();  

useEffect(() => {
  console.log("Estado de auth en AdminLayout:", { 
    logout: !!logout, // Verificar si la función existe
    // También podrías imprimir isAuthenticated y user para más contexto
  });
}, [logout]);

  const handleLogout = async () => {
    try {
      console.log("Cerrando sesión...");
      
      // Ejecutar logout del contexto
      if (logout) {
        await logout();
      }
      
      // Navegación a la página de autenticación
      navigate('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <Box sx={{ display: 'flex', bgcolor: 'background.default' }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'primary.main' }}
          elevation={1}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Admin Panel
            </Typography>
            <Tooltip title="Cerrar Sesión">
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: 'primary.main', color: 'white' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <Tooltip title={item.tooltip} placement="right" key={item.text}>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to={item.path} selected={location.pathname === item.path} sx={{ '&.Mui-selected': { backgroundColor: 'rgba(255, 255, 255, 0.16)' }, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}>
                      <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default AdminLayout;