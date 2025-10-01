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
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/priceUtils.js';
import { COLORS, BUTTON_STYLES, CARD_STYLES } from '../utils/colorConstants.js';

function CartPage() {
  const { cartItems, addToCart, removeFromCart, deleteItemFromCart, clearCart, getCartTotal } = useCart();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  // Estados para simular detalles de pago
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !snackbarOpen) {
      setSnackbarMessage('Tu carrito está vacío. Añade productos para continuar.');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
  }, [cartItems.length]);

  const handleIncrementQuantity = (item) => {
    if (item.quantity < item.stock) {
      addToCart(item, 1);
    } else {
      setSnackbarMessage(`No puedes añadir más de "${item.name}". Stock disponible: ${item.stock}.`);
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    }
  };

  const handleDecrementQuantity = (item) => {
    if (item.quantity > 1) {
      removeFromCart(item.id, 1);
    } else {
      handleDeleteItem(item.id, item.name);
    }
  };

  const handleDeleteItem = (itemId, itemName) => {
    deleteItemFromCart(itemId);
    setSnackbarMessage(`"${itemName}" eliminado del carrito.`);
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setSnackbarMessage('Tu carrito está vacío. Añade productos antes de proceder al checkout.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    if (!cardNumber || !expiryDate || !cvv) {
      setSnackbarMessage('Por favor, completa todos los campos de pago.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoadingCheckout(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbarMessage('Debes iniciar sesión para realizar una compra.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        navigate('/auth');
        return;
      }

      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: getCartTotal(),
        paymentMethod: 'credit_card',
        paymentDetails: {
          cardNumber: cardNumber.slice(-4),
          expiryDate: expiryDate
        }
      };

      const response = await axios.post('http://localhost:3001/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      clearCart();
      setSnackbarMessage('¡Compra realizada exitosamente! Serás redirigido a tus órdenes.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate('/orders');
      }, 2000);

    } catch (error) {
      console.error('Error en el checkout:', error);
      setSnackbarMessage(error.response?.data?.message || 'Error al procesar la compra. Inténtalo de nuevo.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        textAlign: 'center', 
        mb: 4, 
        color: COLORS.primary.main,
        fontWeight: 700
      }}>
        Tu Carrito de Compras
      </Typography>

      {cartItems.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 8, 
          p: 4, 
          ...CARD_STYLES.base,
          maxWidth: 600,
          mx: 'auto'
        }}>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            Tu carrito está vacío 😔
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', mb: 3 }}>
            ¡Explora nuestros productos y encuentra tus favoritos!
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ 
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              ...BUTTON_STYLES.primary,
            }}
            onClick={() => navigate('/products')}
          >
            Ir a Productos
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => (
              <Card key={item.id} sx={{ 
                display: 'flex', 
                mb: 2, 
                p: 2, 
                ...CARD_STYLES.base,
                ...CARD_STYLES.hover,
              }}>
                <CardMedia
                  component="img"
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    objectFit: 'contain', 
                    borderRadius: 1, 
                    mr: 2,
                    backgroundColor: COLORS.background.paper,
                    p: 1
                  }}
                  image={item.imagenURL || "https://placehold.co/120x120/4a4a4a/f0f0f0?text=No+Image"}
                  alt={item.name}
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/120x120/4a4a4a/f0f0f0?text=Imagen+no+disponible"; }}
                />
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  p: 0 
                }}>
                  <Typography variant="h6" component="div" sx={{ 
                    color: COLORS.text.primary,
                    fontWeight: 600,
                    mb: 1
                  }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Precio Unitario: ${formatPrice(item.price)}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: COLORS.primary.main,
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  }}>
                    Subtotal: ${formatPrice(item.price * item.quantity)}
                  </Typography>
                </CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  ml: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDecrementQuantity(item)}
                      sx={{ 
                        color: COLORS.text.secondary,
                        '&:hover': { backgroundColor: 'rgba(212, 165, 165, 0.1)' }
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      variant="outlined"
                      size="small"
                      value={item.quantity}
                      sx={{ 
                        width: 60, 
                        mx: 1, 
                        input: { 
                          textAlign: 'center', 
                          color: COLORS.text.primary,
                          fontWeight: 600
                        } 
                      }}
                      InputProps={{ readOnly: true }}
                    />
                    <IconButton 
                      size="small" 
                      onClick={() => handleIncrementQuantity(item)}
                      sx={{ 
                        color: COLORS.text.secondary,
                        '&:hover': { backgroundColor: 'rgba(212, 165, 165, 0.1)' }
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteItem(item.id, item.name)} 
                    sx={{ 
                      color: 'error.main',
                      '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #dbb6ee, #b57edc)',
              borderRadius: 3,
              boxShadow: COLORS.shadows.heavy,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                color: COLORS.text.light, 
                textAlign: 'center', 
                fontWeight: 700,
                mb: 3
              }}>
                Resumen del Pedido
              </Typography>
              <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 3,
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 2
              }}>
                <Typography variant="h6" sx={{ color: COLORS.text.light, fontWeight: 600 }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ color: COLORS.text.light, fontWeight: 700 }}>
                  ${formatPrice(getCartTotal())}
                </Typography>
              </Box>

              {/* Campos de pago simulados */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: COLORS.text.light, mb: 2 }}>
                  Información de Pago
                </Typography>
                <TextField
                  label="Número de Tarjeta"
                  variant="outlined"
                  fullWidth
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="MM/AA"
                    variant="outlined"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="12/25"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="CVV"
                    variant="outlined"
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ 
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  ...BUTTON_STYLES.primary,
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    color: '#999',
                  },
                }}
                onClick={handleCheckout}
                disabled={loadingCheckout || cartItems.length === 0}
              >
                {loadingCheckout ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Compra'}
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
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
