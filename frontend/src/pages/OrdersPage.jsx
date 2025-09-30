// src/pages/OrdersPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Button // Para el botón de "Ir a productos" si no hay órdenes
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx'; // Importa el hook useAuth

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth(); // Obtén el estado de autenticación y carga

  useEffect(() => {
    // Si la autenticación aún está cargando, no hacer nada.
    if (authLoading) {
      return;
    }

    // Redirigir al login si el usuario no está autenticado
    if (!isAuthenticated || !localStorage.getItem('token')) {
      navigate('/auth');
      return; // Detener la ejecución del efecto
    }
   
    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token'); // Obtener el token del localStorage

        if (!token) {
          throw new Error('No se encontró token de autenticación.');
        }

        const response = await axios.get('http://localhost:3001/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setOrders(response.data);
      } catch (err) {
        console.error('Error al obtener las órdenes del usuario:', err);
        setError(err.response?.data?.message || 'No se pudieron cargar tus órdenes. Inténtalo de nuevo más tarde.');
        // Si el error es 401 (Unauthorized), redirigir al login
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [isAuthenticated, authLoading, navigate]); // Dependencias del efecto

  if (loading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2, color: 'text.primary' }}>Cargando tus órdenes...</Typography>
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
          onClick={() => navigate('/')}
        >
          Volver al Inicio
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, color: 'secondary.main' }}>
        Mis Órdenes
      </Typography>

      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8, p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h5" color="text.secondary">
            Aún no tienes pedidos realizados 😥
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
            ¡Es el momento perfecto para explorar nuestro catálogo!
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 3, borderRadius: 8 }}
            onClick={() => navigate('/products')}
          >
            Explorar Productos
          </Button>
        </Box>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, p: 2 }}>
          {orders.map((order, index) => (
            <React.Fragment key={order.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  py: 2,
                  px: { xs: 1, sm: 2 },
                  '&:hover': {
                    backgroundColor: 'rgba(229, 62, 144, 0.05)', // Un ligero hover
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{ display: 'inline', color: 'text.primary', fontWeight: 'bold' }}
                      component="span"
                      variant="body1"
                    >
                      Orden #{order.id}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'block', color: 'text.secondary' }}
                        component="span"
                        variant="body2"
                      >
                        Fecha: {new Date(order.date).toLocaleDateString()}
                      </Typography>
                      <Typography
                        sx={{ display: 'block', color: 'text.secondary' }}
                        component="span"
                        variant="body2"
                      >
                        Estado: <Box component="span" sx={{
                            color: order.state === 'pagado' ? 'success.main' :
                                   order.state === 'pendiente' ? 'warning.main' :
                                   'text.primary',
                            fontWeight: 'bold'
                        }}>
                            {order.state.charAt(0).toUpperCase() + order.state.slice(1)}
                        </Box>
                      </Typography>
                    </React.Fragment>
                  }
                  sx={{ flex: '1 1 auto' }}
                />
                <Box sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 1, sm: 0 }, flexShrink: 0 }}>
                  <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                    Total: ${order.total.toFixed(2)}
                  </Typography>
                </Box>
                {/* Botón para ver el detalle de la orden - Pendiente de implementar el detalle */}
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  sx={{ ml: { xs: 0, sm: 3 }, mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}
                  onClick={() => console.log('Ver detalle de la orden:', order.id)} // Placeholder
                >
                  Ver Detalle
                </Button>
              </ListItem>
              {index < orders.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Container>
  );
}

export default OrdersPage;
