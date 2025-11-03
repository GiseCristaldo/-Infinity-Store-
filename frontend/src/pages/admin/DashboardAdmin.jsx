import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Tooltip, IconButton
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import LogoutIcon from '@mui/icons-material/Logout';

// --- Importar los componentes de las páginas de admin ---
import AdminUsers from './AdminUsers';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';

const drawerWidth = 240;

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
  );
}

export default AdminDashboard;