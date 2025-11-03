import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Box, Card, CardContent, 
  List, ListItem, ListItemText, CircularProgress, 
  Divider, Button, IconButton, Alert, Container, Avatar
} from '@mui/material';
import { ADMIN_COLORS } from '../../utils/colorConstants.js';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { getUsers } from '../../services/userService';
import { getProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getOrders } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

function DashboardAdmin() {
  const [stats, setStats] = useState({
    users: { count: 0, loading: true, error: null },
    products: { count: 0, loading: true, error: null },
    categories: { count: 0, loading: true, error: null },
    orders: { count: 0, loading: true, error: null, recentOrders: [] },
  });

  useEffect(() => {
    // Cargar estadísticas de usuarios
    getUsers(1, 1)
      .then(data => {
        console.log('Datos de usuarios recibidos:', data);
        setStats(prev => ({
          ...prev,
          users: { 
            ...prev.users, 
            // Accedemos a totalItems que es la propiedad correcta según el backend
            count: data.totalItems || 0,
            loading: false
          }
        }));
      })
      .catch(err => {
        console.error('Error al cargar usuarios:', err);
        setStats(prev => ({
          ...prev,
          users: { 
            ...prev.users, 
            error: 'Error al cargar usuarios', 
            loading: false 
          }
        }));
      });

    // Cargar estadísticas de productos
    getProducts(1, 1)
      .then(data => {
        console.log('Datos de productos recibidos:', data);
        setStats(prev => ({
          ...prev,
          products: { 
            ...prev.products, 
            // Accedemos a totalItems que es la propiedad correcta según el backend
            count: data.totalItems || 0,
            loading: false
          }
        }));
      })
      .catch(err => {
        console.error('Error al cargar productos:', err);
        setStats(prev => ({
          ...prev,
          products: { 
            ...prev.products, 
            error: 'Error al cargar productos', 
            loading: false 
          }
        }));
      });

    // Cargar estadísticas de categorías
    getAllCategories()
      .then(data => {
        console.log('Datos de categorías recibidos:', data);
        setStats(prev => ({
          ...prev,
          categories: { 
            ...prev.categories, 
            // Para categorías, esperamos un array o un objeto con propiedades útiles
            count: Array.isArray(data) ? data.length : (data.categories ? data.categories.length : 0),
            loading: false
          }
        }));
      })
      .catch(err => {
        console.error('Error al cargar categorías:', err);
        setStats(prev => ({
          ...prev,
          categories: { 
            ...prev.categories, 
            error: 'Error al cargar categorías', 
            loading: false 
          }
        }));
      });

    // Cargar estadísticas de órdenes
    getOrders(1, 5)
      .then(data => {
        console.log('Datos de órdenes recibidos:', data);
        setStats(prev => ({
          ...prev,
          orders: { 
            ...prev.orders, 
            // Accedemos a totalItems que es la propiedad correcta según el backend
            count: data.totalItems || 0,
            recentOrders: data.orders || [],
            loading: false
          }
        }));
      })
      .catch(err => {
        console.error('Error al cargar órdenes:', err);
        setStats(prev => ({
          ...prev,
          orders: { 
            ...prev.orders, 
            error: 'Error al cargar órdenes', 
            loading: false 
          }
        }));
      });
  }, []);

  // Componente para las tarjetas de estadísticas con gradientes
  const StatCard = ({ title, value, icon, loading, error, linkTo, gradientColors }) => (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        background: gradientColors || `linear-gradient(135deg, #7e57c2 0%, #a806ff 100%)`,
        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        },
      }}
      elevation={0}
    >
      <CardContent sx={{ 
        position: 'relative', 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:last-child': {
          pb: 3
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 1.5 
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              textShadow: '0px 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            {title}
          </Typography>
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 48, 
              height: 48,
              boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 3,
            height: '100px'
          }}>
            <CircularProgress size={36} sx={{ color: 'white' }} />
          </Box>
        ) : error ? (
          <Box sx={{ height: '100px' }}>
            <Alert 
              severity="error" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.9)',
                '& .MuiAlert-icon': { color: 'error.main' }
              }}
            >
              {error}
            </Alert>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button 
                component={Link} 
                to={linkTo} 
                endIcon={<ArrowForwardIcon />} 
                variant="contained"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.25)', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                }}
                size="small"
              >
                Ver sección
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Typography 
              variant="h2" 
              component="div" 
              sx={{ 
                fontWeight: 'bold', 
                my: 3, 
                fontSize: '3.5rem',
                color: 'white',
                textShadow: '0px 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {value}
            </Typography>
            <Box 
              sx={{ 
                mt: 'auto', 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 2,
                borderTop: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 'medium'
                }}
              >
                Total actual
              </Typography>
              <Button 
                component={Link} 
                to={linkTo} 
                endIcon={<ArrowForwardIcon />} 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Ver detalles
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );

  // Obtener el usuario actual usando el hook personalizado
  const { user } = useAuth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Encabezado de bienvenida */}
      <Card 
        sx={{ 
          mb: 4, 
          borderRadius: 3,
          background: ADMIN_COLORS.background.gradient,
          boxShadow: ADMIN_COLORS.shadows.medium
        }}
        elevation={0}
      >
        <CardContent sx={{ p: 3, position: 'relative' }}>
          {/* Fecha fija en la esquina superior derecha */}
          <Typography 
            variant="body2"
            sx={{ 
              position: 'absolute',
              top: 16,
              right: 16,
              color: ADMIN_COLORS.primary.dark
            }}
          >
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={12}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#141414',
                  mb: 1,
                  textShadow: '0px 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Bienvenido al Panel de Control
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  color: ADMIN_COLORS.primary.dark,
                  maxWidth: '80%'
                }}
              >
                {user ? `Hola, ${user.nombre || user.email}. ` : ''}
                Aquí podrás gestionar todos los aspectos de tu tienda.
              </Typography>
            </Grid>
            {/* Se eliminó el Grid con la fecha duplicada */}
          </Grid>
        </CardContent>
      </Card>
      
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <DashboardIcon sx={{ fontSize: '1.75rem', color: ADMIN_COLORS.primary.main }} /> Resumen General
      </Typography>
      
      <Grid container spacing={3}>
        {/* Tarjetas de estadísticas mejoradas con gradientes */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Usuarios" 
            value={stats.users.count} 
            icon={<PersonIcon sx={{ color: 'white', fontSize: '1.75rem' }} />} 
            loading={stats.users.loading} 
            error={stats.users.error}
            linkTo="/admin/users"
            gradientColors={`linear-gradient(135deg, ${ADMIN_COLORS.primary.dark} 0%, ${ADMIN_COLORS.primary.main} 100%)`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Productos" 
            value={stats.products.count} 
            icon={<InventoryIcon sx={{ color: 'white', fontSize: '1.75rem' }} />} 
            loading={stats.products.loading} 
            error={stats.products.error}
            linkTo="/admin/products"
            gradientColors={`linear-gradient(135deg, ${ADMIN_COLORS.primary.dark} 0%, ${ADMIN_COLORS.primary.main} 100%)`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Categorías" 
            value={stats.categories.count} 
            icon={<CategoryIcon sx={{ color: 'white', fontSize: '1.75rem' }} />} 
            loading={stats.categories.loading} 
            error={stats.categories.error}
            linkTo="/admin/categories"
            gradientColors={`linear-gradient(135deg, ${ADMIN_COLORS.primary.dark} 0%, ${ADMIN_COLORS.primary.main} 100%)`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Órdenes" 
            value={stats.orders.count} 
            icon={<ShoppingCartIcon sx={{ color: 'white', fontSize: '1.75rem' }} />} 
            loading={stats.orders.loading} 
            error={stats.orders.error}
            linkTo="/admin/orders"
            gradientColors={`linear-gradient(135deg, ${ADMIN_COLORS.primary.dark} 0%, ${ADMIN_COLORS.primary.main} 100%)`}
          />
        </Grid>

        {/* Título de sección */}
        <Grid item xs={12}>
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 3, 
              mb: 2, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
          </Typography>
        </Grid>

        {/* Órdenes recientes con mejor diseño */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s ease',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              transform: 'translateY(-2px)'
            }
          }} elevation={0}>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ 
                p: 2.5, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: ADMIN_COLORS.background.overlay
              }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5
                  }}
                >
                  <ShoppingCartIcon sx={{ color: 'secondary.main' }} />
                  Órdenes recientes
                </Typography>
                <Button 
                  component={Link} 
                  to="/admin/orders" 
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 'medium',
                    fontSize: '0.875rem'
                  }}
                >
                  Ver todas
                </Button>
              </Box>
              
              {stats.orders.loading ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  py: 5,
                  height: '260px'
                }}>
                  <CircularProgress size={40} sx={{ mb: 2, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Cargando órdenes recientes...
                  </Typography>
                </Box>
              ) : stats.orders.error ? (
                <Alert 
                  severity="error" 
                  sx={{ 
                    m: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Error al cargar órdenes
                    </Typography>
                    <Typography variant="body2">{stats.orders.error}</Typography>
                  </Box>
                </Alert>
              ) : stats.orders.recentOrders.length > 0 ? (
                <List sx={{ py: 0 }}>
                  {stats.orders.recentOrders.map((order, index) => (
                    <React.Fragment key={order.id}>
                      <ListItem 
                        component={Link}
                        to={`/admin/orders/${order.id}`}
                        sx={{ 
                          py: 2,
                          px: 2.5,
                          transition: 'all 0.2s ease',
                          textDecoration: 'none',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.02)'
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            mr: 2,
                            bgcolor: 'primary.light',
                            width: 42,
                            height: 42,
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {order.id}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 'bold',
                                mb: 0.5,
                                color: 'text.primary'
                              }}
                            >
                              {order.user?.nombre || 'Cliente'}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'text.secondary',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                Orden #{order.id} • ${order.total?.toFixed(2) || '0.00'}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ 
                          ml: 'auto',
                          bgcolor: 
                            order.status === 'pendiente' ? 'rgba(255, 193, 7, 0.15)' : 
                            order.status === 'procesando' ? 'rgba(33, 150, 243, 0.15)' : 
                            order.status === 'enviado' ? 'rgba(76, 175, 80, 0.15)' :
                            order.status === 'entregado' ? 'rgba(76, 175, 80, 0.15)' : 
                            'rgba(244, 67, 54, 0.15)',
                          color: 
                            order.status === 'pendiente' ? '#FF9800' : 
                            order.status === 'procesando' ? '#2196F3' : 
                            order.status === 'enviado' ? '#4CAF50' :
                            order.status === 'entregado' ? '#4CAF50' : 
                            '#F44336',
                          px: 2,
                          py: 0.75,
                          borderRadius: 10,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          border: '1px solid',
                          borderColor:
                            order.status === 'pendiente' ? 'rgba(255, 193, 7, 0.3)' : 
                            order.status === 'procesando' ? 'rgba(33, 150, 243, 0.3)' : 
                            order.status === 'enviado' ? 'rgba(76, 175, 80, 0.3)' :
                            order.status === 'entregado' ? 'rgba(76, 175, 80, 0.3)' : 
                            'rgba(244, 67, 54, 0.3)',
                        }}>
                          {order.status || 'pendiente'}
                        </Box>
                      </ListItem>
                      {index < stats.orders.recentOrders.length - 1 && 
                        <Divider 
                          sx={{ 
                            mx: 2.5,
                            opacity: 0.6
                          }} 
                        />
                      }
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    height: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                    No hay órdenes recientes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Las nuevas órdenes aparecerán aquí
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Accesos rápidos con diseño mejorado */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s ease',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              transform: 'translateY(-2px)'
            }
          }} elevation={0}>
            <CardContent sx={{ 
              p: 0, 
              '&:last-child': { pb: 0 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ 
                p: 2.5, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: ADMIN_COLORS.background.overlay
              }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5
                  }}
                >
                  <SettingsIcon sx={{ color: 'secondary.main' }} />
                  Accesos rápidos
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 2.5, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2.5,
                flexGrow: 1
              }}>
                <Grid container spacing={2.5}>
                  {/* Tarjeta de gestión de productos */}
                  <Grid item xs={12} sm={6}>
                    <Card 
                      component={Link}
                      to="/admin/products"
                      sx={{ 
                        p: 2.5,
                        height: '100%',
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        backgroundColor: 'rgba(212, 165, 165, 0.08)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(212, 165, 165, 0.12)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          width: 45, 
                          height: 45,
                          mb: 1.5
                        }}
                      >
                        <InventoryIcon />
                      </Avatar>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1,
                          fontSize: '0.95rem'
                        }}
                      >
                        Gestionar Productos
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: 1.5, flexGrow: 1 }}
                      >
                        Agregar, editar y organizar el catálogo de productos
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'primary.main',
                        fontWeight: 'medium',
                        fontSize: '0.85rem'
                      }}>
                        IR AL MÓDULO <ArrowForwardIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
                      </Box>
                    </Card>
                  </Grid>

                  {/* Tarjeta de gestión de categorías */}
                  <Grid item xs={12} sm={6}>
                    <Card 
                      component={Link}
                      to="/admin/categories"
                      sx={{ 
                        p: 2.5,
                        height: '100%',
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        backgroundColor: 'rgba(212, 165, 165, 0.08)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(212, 165, 165, 0.12)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: 'secondary.main', 
                          width: 45, 
                          height: 45,
                          mb: 1.5
                        }}
                      >
                        <CategoryIcon />
                      </Avatar>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1,
                          fontSize: '0.95rem'
                        }}
                      >
                        Gestionar Categorías
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: 1.5, flexGrow: 1 }}
                      >
                        Organizar productos en categorías y subcategorías
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'secondary.main',
                        fontWeight: 'medium',
                        fontSize: '0.85rem'
                      }}>
                        IR AL MÓDULO <ArrowForwardIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
                      </Box>
                    </Card>
                  </Grid>

                  {/* Tarjeta de gestión de usuarios */}
                  <Grid item xs={12} sm={6}>
                    <Card 
                      component={Link}
                      to="/admin/users"
                      sx={{ 
                        p: 2.5,
                        height: '100%',
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        backgroundColor: 'rgba(212, 165, 165, 0.08)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(212, 165, 165, 0.12)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                        bgcolor: ADMIN_COLORS.primary.dark, 
                          width: 45, 
                          height: 45,
                          mb: 1.5
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1,
                          fontSize: '0.95rem'
                        }}
                      >
                        Gestionar Usuarios
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: 1.5, flexGrow: 1 }}
                      >
                        Administrar usuarios, permisos y roles del sistema
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#6A0DAD',
                        fontWeight: 'medium',
                        fontSize: '0.85rem'
                      }}>
                        IR AL MÓDULO <ArrowForwardIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
                      </Box>
                    </Card>
                  </Grid>

                  {/* Tarjeta de gestión de órdenes */}
                  <Grid item xs={12} sm={6}>
                    <Card 
                      component={Link}
                      to="/admin/orders"
                      sx={{ 
                        p: 2.5,
                        height: '100%',
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        backgroundColor: 'rgba(242, 138, 160, 0.08)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(242, 138, 160, 0.12)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                        bgcolor: ADMIN_COLORS.primary.dark, 
                          width: 45, 
                          height: 45,
                          mb: 1.5
                        }}
                      >
                        <ShoppingCartIcon />
                      </Avatar>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1,
                          fontSize: '0.95rem'
                        }}
                      >
                        Gestionar Órdenes
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: 1.5, flexGrow: 1 }}
                      >
                        Revisar, actualizar y procesar órdenes de clientes
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#2A004B',
                        fontWeight: 'medium',
                        fontSize: '0.85rem'
                      }}>
                        IR AL MÓDULO <ArrowForwardIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardAdmin;
