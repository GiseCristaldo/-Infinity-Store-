import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Tooltip, IconButton
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles'; // Importar para el tema
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import LogoutIcon from '@mui/icons-material/Logout';

// --- Importar los componentes de las páginas de admin ---
import AdminUsers from './AdminUsers';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';

const drawerWidth = 240;

// --- 1. DEFINIR EL TEMA PERSONALIZADO ---
const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#7e57c2', // <-- CAMBIO: Un morado más claro y vibrante, similar al ejemplo.
    },
    background: {
      default: '#ffffff', // Fondo principal blanco
    },
    text: {
      primary: '#212121', // Texto principal oscuro para alto contraste
      secondary: '#757575', // Texto secundario más suave
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600, // Títulos de página más gruesos
      fontSize: '1.5rem',
    },
    // Estilo para los encabezados de tabla
    tableHeader: {
      fontWeight: 'bold',
      fontSize: '0.875rem',
      color: '#212121',
    },
  },
  components: {
    // Estilo global para los encabezados de tabla
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f5f5f5', // Fondo gris claro para encabezados
          fontWeight: 700,
          color: '#212121',
        },
      },
    },
  },
});

function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const menuItems = [
    { text: 'Dashboard', path: '/admin', icon: <DashboardIcon />, tooltip: 'Ver el inicio del dashboard' },
    { text: 'Usuarios', path: '/admin/users', icon: <PeopleIcon />, tooltip: 'Gestionar usuarios' },
    { text: 'Categorías', path: '/admin/categories', icon: <CategoryIcon />, tooltip: 'Gestionar categorías' },
  ];

  return (
    // --- 2. APLICAR EL TEMA CON THEMEPROVIDER ---
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
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: 'primary.main',
              color: 'white',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <Tooltip title={item.tooltip} placement="right" key={item.text}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      selected={location.pathname === item.path}
                      sx={{
                        '&.Mui-selected': { backgroundColor: 'rgba(255, 255, 255, 0.16)' },
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                      }}
                    >
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
          <Routes>
            <Route path="/" element={<Typography variant="h5">Bienvenido al Panel de Administración</Typography>} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default AdminDashboard;