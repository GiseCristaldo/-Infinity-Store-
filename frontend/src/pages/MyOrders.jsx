import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, Grid,
  CircularProgress, Alert, useTheme, useMediaQuery, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import OrderDetailModal from '../components/OrderDetailModal';
import axios from 'axios';

const statusColors = {
  'pendiente': 'warning',
  'confirmada': 'info',
  'en_preparacion': 'primary',
  'enviada': 'secondary',
  'entregada': 'success',
  'cancelada': 'error'
};

const statusLabels = {
  'pendiente': 'Pendiente',
  'confirmada': 'Confirmada',
  'en_preparacion': 'En Preparación',
  'enviada': 'Enviada',
  'entregada': 'Entregada',
  'cancelada': 'Cancelada'
};

function MyOrders() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrder(response.data.order);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('Error loading order details:', error);
      setError('Error al cargar los detalles de la orden');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Mis Pedidos
      </Typography>

      {orders.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 4, borderRadius: 2 }}>
          <ShoppingBagIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tienes pedidos aún
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cuando realices tu primer pedido, aparecerá aquí.
          </Typography>
        </Card>
      ) : (
        <>
          {isMobile ? (
            // Vista móvil - Cards
            <Grid container spacing={2}>
              {orders.map((order) => (
                <Grid item xs={12} key={order.id}>
                  <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Orden #{order.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(order.created_at)}
                          </Typography>
                        </Box>
                        <Chip
                          label={statusLabels[order.state] || order.state}
                          color={statusColors[order.state] || 'default'}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <ReceiptIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {order.items?.length || 0} productos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • {formatCurrency(order.total)}
                        </Typography>
                      </Box>

                      {order.items?.slice(0, 2).map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Avatar
                            src={item.image}
                            variant="rounded"
                            sx={{ width: 24, height: 24 }}
                          />
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {item.name} × {item.quantity}
                          </Typography>
                        </Box>
                      ))}

                      {order.items?.length > 2 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          +{order.items.length - 2} productos más
                        </Typography>
                      )}

                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(order.id)}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Ver Detalles
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Vista desktop - Tabla
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Orden</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Productos</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          #{order.id}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(order.created_at)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={statusLabels[order.state] || order.state}
                          color={statusColors[order.state] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {order.items?.slice(0, 3).map((item, index) => (
                            <Avatar
                              key={index}
                              src={item.image}
                              variant="rounded"
                              sx={{ width: 24, height: 24 }}
                            />
                          ))}
                          <Typography variant="body2" color="text.secondary">
                            {order.items?.length || 0} productos
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(order.total)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(order.id)}
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Modal de detalles */}
      <OrderDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </Box>
  );
}

export default MyOrders;