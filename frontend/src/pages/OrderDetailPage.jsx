// src/pages/OrderDetailPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

function OrderDetailPage() {
  const { orderId } = useParams(); // Obtiene el ID de la orden de la URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No se encontró token de autenticación.');
        }

        // Endpoint para obtener el detalle de una orden específica (incluyendo ítems)
        // Necesitarás asegurar que tu backend tiene un endpoint como /api/orders/:id/details
        // que devuelva la orden con sus productos.
        const response = await axios.get(`http://localhost:3001/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setOrder(response.data);
      } catch (err) {
        console.error('Error al obtener el detalle de la orden:', err);
        setError(err.response?.data?.message || 'No se pudo cargar el detalle de la orden.');
        if (err.response && err.response.status === 404) {
            setError('La orden solicitada no existe o no te pertenece.');
        } else if (err.response && err.response.status === 401) {
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) { // Solo si tenemos un orderId en la URL
        fetchOrderDetails();
    } else {
        // Manejar el caso donde no hay orderId en la URL (ej. si acceden a /mis-ordenes/ sin un ID)
        setError('No se especificó un ID de orden.');
        setLoading(false);
    }

  }, [orderId, isAuthenticated, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2, color: 'text.primary' }}>Cargando detalle de la orden...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 3, borderRadius: 8 }}
          onClick={() => navigate('/mis-ordenes')}
        >
          Volver a Mis Órdenes
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">
          Orden no encontrada.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 3, borderRadius: 8 }}
          onClick={() => navigate('/mis-ordenes')}
        >
          Volver a Mis Órdenes
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, color: 'secondary.main' }}>
        Detalle de Orden #{order.id}
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold', mb: 1 }}>
              Información de la Orden
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Fecha: {new Date(order.date).toLocaleDateString()}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Estado: <Box component="span" sx={{
                  color: order.state === 'pagado' ? 'success.main' :
                         order.state === 'pendiente' ? 'warning.main' :
                         'text.primary',
                  fontWeight: 'bold'
              }}>
                  {order.state.charAt(0).toUpperCase() + order.state.slice(1)}
              </Box>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total: <Typography component="span" variant="h6" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                ${order.total.toFixed(2)}
              </Typography>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold', mb: 1 }}>
              Información del Comprador
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Nombre: {order.user?.nombre || 'N/A'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Email: {order.user?.email || 'N/A'}
            </Typography>
            {/* Puedes añadir más información del usuario si tu backend la provee */}
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
        Productos de la Orden
      </Typography>
      {order.orderItems && order.orderItems.length > 0 ? (
        <Grid container spacing={3}>
          {order.orderItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ display: 'flex', borderRadius: 2, height: '100%' }}>
                <CardMedia
                  component="img"
                  sx={{ width: 100, height: 100, objectFit: 'contain', p: 1, backgroundColor: 'background.default' }}
                  image={item.product?.imageURL || "https://placehold.co/100x100/4a4a4a/f0f0f0?text=No+Image"}
                  alt={item.product?.name || 'Producto Desconocido'}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/4a4a4a/f0f0f0?text=Imagen+no+disponible"; }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                    {item.product?.name || 'Producto Desconocido'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cantidad: {item.amount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Precio Unitario: ${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal: ${typeof item.price === 'number' && typeof item.amount === 'number' ? (item.amount * item.price).toFixed(2) : (parseInt(item.amount || 0) * parseFloat(item.price || 0)).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No se encontraron productos para esta orden.
          </Typography>
        </Paper>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          color="secondary"
          sx={{ mr: 2, borderRadius: 8 }}
          onClick={() => navigate('/mis-ordenes')}
        >
          Volver a Mis Órdenes
        </Button>
        <Button
          variant="contained"
          color="primary" // O el color que desees para "Seguir Comprando"
          sx={{ borderRadius: 8 }}
          onClick={() => navigate('/products')}
        >
          Seguir Comprando
        </Button>
      </Box>
    </Container>
  );
}

export default OrderDetailPage;
