// src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  Snackbar,
  CircularProgress // Agregado para el loading state del checkout
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importar axios para la llamada al backend

import { useCart } from '../context/CartContext.jsx'; // <-- Importa el hook useCart

function CartPage() {
  // Obtén el estado y las funciones del carrito desde el contexto
  const { cartItems, addToCart, removeFromCart, deleteItemFromCart, clearCart, getCartTotal } = useCart();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  // Estados para simular detalles de pago (para la pasarela simulada)
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loadingCheckout, setLoadingCheckout] = useState(false); // Para el estado de carga del checkout

  // Validar si el carrito está vacío al cargar la página (y si se vacía después de una compra)
  useEffect(() => {
    // Si llegamos a esta página y el carrito está vacío, mostramos un mensaje.
    // Esto se mantiene, pero la lógica de vaciado ocurre ahora en handleCheckout.
    if (cartItems.length === 0 && !snackbarOpen) { // Solo si no hay un snackbar activo (para evitar mostrarlo justo después de vaciarlo)
      setSnackbarMessage('Tu carrito está vacío. Añade productos para continuar.');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
  }, [cartItems.length]); // Dependencia: reacciona si la cantidad de ítems en el carrito cambia

  // Función para manejar el incremento de cantidad desde el carrito (usa la del contexto)
  const handleIncrementQuantity = (item) => {
    // Es buena práctica validar el stock aquí también antes de añadir
    if (item.quantity < item.stock) {
      addToCart(item, 1);
      setSnackbarMessage(`Cantidad de "${item.name}" actualizada.`);
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage(`Has alcanzado el stock máximo (${item.stock}) para "${item.name}".`);
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    }
  };

  // Función para manejar el decremento de cantidad desde el carrito (usa la del contexto)
  const handleDecrementQuantity = (item) => {
    if (item.quantity > 1) {
      removeFromCart(item.id, 1);
      setSnackbarMessage(`Cantidad de "${item.name}" actualizada.`);
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    } else {
      deleteItemFromCart(item.id);
      setSnackbarMessage(`"${item.name}" eliminado del carrito.`);
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    }
  };

  // Función para eliminar completamente un producto desde el carrito (usa la del contexto)
  const handleDeleteItem = (productId, productName) => {
    deleteItemFromCart(productId);
    setSnackbarMessage(`"${productName}" eliminado completamente del carrito.`);
    setSnackbarSeverity('warning');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Lógica de Checkout ahora con llamada al backend
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setSnackbarMessage('Tu carrito está vacío. Añade productos para continuar.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoadingCheckout(true); // Inicia el estado de carga
    setSnackbarOpen(false); // Cierra cualquier snackbar previo

    try {
      const token = localStorage.getItem('token'); // Obtener el token JWT
      if (!token) {
        setSnackbarMessage('Debes iniciar sesión para finalizar la compra.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoadingCheckout(false);
        navigate('/mis-ordenes'); // Redirige a la página de órdenes si no hay token
        return;
      }

      // Preparar los ítems para la API (solo productId y amount)
      const itemsForOrder = cartItems.map(item => ({
        productId: item.id,
        amount: item.quantity,
      }));

      const orderData = {
        items: itemsForOrder,
        paymentInfo: { // Simulación de datos de pago
          cardNumber: cardNumber,
          expiryDate: expiryDate,
          cvv: cvv,
        }
      };

      const response = await axios.post('http://localhost:3001/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}` // Adjuntar el token JWT
        }
      });

      // Si la orden se creó con éxito en el backend
      setSnackbarMessage(response.data.message || '¡Tu compra ha sido realizada con éxito!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      clearCart(); // Vaciar el carrito en el frontend solo si el backend tuvo éxito
      setCardNumber(''); // Limpiar campos de pago
      setExpiryDate('');
      setCvv('');
      navigate('/mis-ordenes'); // Opcional: redirigir al historial de órdenes
      
    } catch (err) {
      console.error('Error durante el checkout:', err.response?.data || err.message);
      setSnackbarMessage(err.response?.data?.message || 'Error al procesar tu compra. Inténtalo de nuevo.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingCheckout(false); // Finaliza el estado de carga
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, color: 'secondary.main' }}>
        Tu Carrito de Compras
      </Typography>

      {cartItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8, p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h5" color="text.secondary">
            Tu carrito está vacío 😔
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
            ¡Explora nuestros productos y encuentra tus favoritos!
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 3, borderRadius: 8 }}
            onClick={() => navigate('/products')}
          >
            Ir a Productos
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => (
              <Card key={item.id} sx={{ display: 'flex', mb: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 2 }}>
                <CardMedia
                  component="img"
                  sx={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 1, mr: 2 }}
                  image={item.imagenURL || "https://placehold.co/100x100/4a4a4a/f0f0f0?text=No+Image"}
                  alt={item.name}
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/4a4a4a/f0f0f0?text=Imagen+no+disponible"; }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 0 }}>
                  <Typography variant="h6" component="div" sx={{ color: 'text.primary' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Precio Unitario: ${item.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body1" color="secondary.main" sx={{ mt: 1 }}>
                    Subtotal: ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <IconButton size="small" onClick={() => handleDecrementQuantity(item)}>
                    <RemoveIcon sx={{ color: 'text.secondary' }} />
                  </IconButton>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={item.quantity}
                    sx={{ width: 60, mx: 1, input: { textAlign: 'center', color: 'text.primary' } }}
                    InputProps={{ readOnly: true }}
                  />
                  <IconButton size="small" onClick={() => handleIncrementQuantity(item)}>
                    <AddIcon sx={{ color: 'text.secondary' }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteItem(item.id, item.name)} sx={{ ml: 2, color: 'error.main' }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
                Resumen del Pedido
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'text.primary' }}>
                  Total:
                </Typography>
                <Typography variant="h6" color="secondary.main">
                  ${getCartTotal().toFixed(2)}
                </Typography>
              </Box>

              {/* Nuevos campos para la información de pago */}
              <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mt: 3 }}>
                Información de Pago (Simulado):
              </Typography>
              <TextField
                label="Número de Tarjeta (Usa '4242' para éxito, 'FAIL' para fallo)"
                variant="outlined"
                fullWidth
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  label="Fecha de Vencimiento (MM/AA)"
                  variant="outlined"
                  fullWidth
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
                <TextField
                  label="CVV"
                  variant="outlined"
                  fullWidth
                  required
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </Box>

              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                sx={{ mt: 2, borderRadius: 8 }}
                onClick={handleCheckout}
                disabled={loadingCheckout || cartItems.length === 0} // Deshabilita durante la carga o si el carrito está vacío
              >
                {loadingCheckout ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Compra (Checkout)'}
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000} // Mayor duración para mensajes de checkout
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CartPage;
