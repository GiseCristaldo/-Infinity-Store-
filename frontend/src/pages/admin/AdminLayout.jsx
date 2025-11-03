// imports y configuración del tema de administración
import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Tooltip, IconButton, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', path: '/admin', icon: <DashboardIcon />, tooltip: 'Ver el inicio del dashboard' },
  { text: 'Usuarios', path: '/admin/users', icon: <PeopleIcon />, tooltip: 'Gestionar usuarios' },
  { text: 'Categorías', path: '/admin/categories', icon: <CategoryIcon />, tooltip: 'Gestionar categorías' },
  { text: 'Órdenes', path: '/admin/orders', icon: <ShoppingCartIcon />, tooltip: 'Gestionar órdenes' },
  { text: 'Productos', path: '/admin/products', icon: <InventoryIcon />, tooltip: 'Gestionar productos' }
];

function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate(); 
    const { logout } = useAuth();  

    const isSmallScreen = useMediaQuery('(max-width:900px)');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(true);

    useEffect(() => {
      console.log("Estado de auth en AdminLayout:", { 
        logout: !!logout,
      });
    }, [logout]);

    const handleLogout = async () => {
      try {
        if (logout) await logout();
        navigate('/auth');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    const drawerContent = (
      <>
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
                      '&.Mui-selected': { backgroundColor: 'primary.light' },
                      '&:hover': { backgroundColor: 'primary.light' },
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <ListItemIcon sx={{ color: 'text.primary' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Box>
      </>
    );

    return (

        <Box sx={{ display: 'flex', bgcolor: 'background.default' }}>
          <AppBar
            position="fixed"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'primary.main', color: 'primary.contrastText' }}
            elevation={1}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => (isSmallScreen ? setMobileOpen(true) : setDrawerOpen((prev) => !prev))}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
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
          {/* Drawer responsive */}
          {isSmallScreen ? (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              ModalProps={{ keepMounted: true }}
              sx={{
                [`& .MuiDrawer-paper`]: {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                },
              }}
            >
              {drawerContent}
            </Drawer>
          ) : (
            <Drawer
              variant="permanent"
              open={drawerOpen}
              sx={{
                width: drawerOpen ? drawerWidth : 72,
                flexShrink: 0,
                transition: 'width 200ms ease',
                [`& .MuiDrawer-paper`]: {
                  width: drawerOpen ? drawerWidth : 72,
                  boxSizing: 'border-box',
                  overflowX: 'hidden',
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  transition: 'width 200ms ease',
                },
              }}
            >
              {/* Adaptar contenido a modo colapsado */}
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
                            '&.Mui-selected': { backgroundColor: 'primary.light' },
                            '&:hover': { backgroundColor: 'primary.light' },
                            px: 2,
                          }}
                        >
                          <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>{item.icon}</ListItemIcon>
                          <ListItemText
                            primary={item.text}
                            sx={{
                              opacity: drawerOpen ? 1 : 0,
                              transition: 'opacity 150ms ease',
                              whiteSpace: 'nowrap',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    </Tooltip>
                  ))}
                </List>
              </Box>
            </Drawer>
          )}

          <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
            <Toolbar />
            <Outlet />
          </Box>
        </Box>
    );
}

export default AdminLayout;