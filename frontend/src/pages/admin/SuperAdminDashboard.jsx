import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Tooltip, IconButton, useMediaQuery,
  Card, CardContent, Grid, Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaletteIcon from '@mui/icons-material/Palette';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import ImageIcon from '@mui/icons-material/Image';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', path: '/super-admin', icon: <DashboardIcon />, tooltip: 'Panel principal' },
  { text: 'Gestión de Admins', path: '/super-admin/admins', icon: <PeopleIcon />, tooltip: 'Gestionar administradores' },
  { text: 'Personalización de Tema', path: '/super-admin/theme', icon: <PaletteIcon />, tooltip: 'Colores y paletas' },
  { text: 'Tipografía', path: '/super-admin/typography', icon: <FontDownloadIcon />, tooltip: 'Fuentes y tipografías' },
  { text: 'Gestión de Imágenes', path: '/super-admin/images', icon: <ImageIcon />, tooltip: 'Hero section y carousel' },
  { text: 'Configuración de Marca', path: '/super-admin/branding', icon: <BrandingWatermarkIcon />, tooltip: 'Nombre y footer' },
  { text: 'Historial de Cambios', path: '/super-admin/history', icon: <HistoryIcon />, tooltip: 'Historial y rollback' }
];

function SuperAdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const isSmallScreen = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    currentSettings: null,
    recentChanges: [],
    adminCount: 0,
    loading: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Comentario: obtenemos el token y preparamos headers de autorización
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Comentario: cargamos configuraciones actuales (ruta pública, proxied por Vite)
      const settingsResponse = await axios.get('/api/settings/current');

      // Comentario: FIX — usamos la ruta correcta con prefijo /super-admin para historial
      const historyResponse = await axios.get('/api/super-admin/customization/history?limit=5', { headers });

      // Comentario: cargamos lista de admins (ruta correcta ya usa /super-admin, requiere token)
      const adminsResponse = await axios.get('/api/super-admin/admins', { headers });

      // Comentario: actualizamos el estado del dashboard con las respuestas
      console.log('Settings response:', settingsResponse.data);
      console.log('Current settings:', settingsResponse.data.data);
      
      setDashboardData({
        currentSettings: settingsResponse.data.data, // Acceder al data anidado
        recentChanges: historyResponse.data.history || [],
        adminCount: adminsResponse.data.admins?.length || 0,
        loading: false
      });
    } catch (error) {
      // Comentario: manejo de error y desactivamos loading en estado
      console.error('Error loading dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

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
      <Toolbar>
        <AdminPanelSettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Super Admin
        </Typography>
      </Toolbar>
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
                    '&.Mui-selected': { 
                      backgroundColor: 'primary.light',
                      color: 'white',
                      '& .MuiListItemIcon-root': { color: 'white' }
                    },
                    '&:hover': { 
                      backgroundColor: 'primary.light',
                      color: 'white',
                      '& .MuiListItemIcon-root': { color: 'white' }
                    },
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Box>
    </>
  );

  const DashboardOverview = () => (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Panel de Super Administración
      </Typography>
      
      <Grid container spacing={3}>
        {/* Tarjeta de configuración actual */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración Actual
              </Typography>
              {dashboardData.loading ? (
                <Typography>Cargando...</Typography>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Nombre del sitio: <strong>{dashboardData.currentSettings?.site_name || 'No configurado'}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Paleta activa: <strong>{dashboardData.currentSettings?.color_palette?.name || 'Predeterminada'}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Fuente principal: <strong>{dashboardData.currentSettings?.primary_font || 'Inter'}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fuente de títulos: <strong>{dashboardData.currentSettings?.heading_font || 'Orbitron'}</strong>
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tarjeta de estadísticas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estadísticas
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Administradores activos: <Chip label={dashboardData.adminCount} color="primary" size="small" />
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Cambios recientes: <Chip label={dashboardData.recentChanges.length} color="secondary" size="small" />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tarjeta de cambios recientes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cambios Recientes
              </Typography>
              {dashboardData.recentChanges.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay cambios recientes
                </Typography>
              ) : (
                <Box>
                  {dashboardData.recentChanges.map((change, index) => (
                    <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>{change.change_type}</strong> - {new Date(change.changed_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Por: {change.changed_by_name || 'Usuario desconocido'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
      <Box sx={{ display: 'flex', bgcolor: 'background.default' }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'primary.main' }}
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
              Super Admin Panel
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
                transition: 'width 200ms ease',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
          <Toolbar />
          {location.pathname === '/super-admin' ? <DashboardOverview /> : <Outlet />}
        </Box>
      </Box>
  );
}

export default SuperAdminDashboard;