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
  CircularProgress,
  Pagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Número de productos por página
  
  // Calcular productos para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cartItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cartItems.length / itemsPerPage);

  useEffect(() => {
    if (cartItems.length === 0 && !snackbarOpen) {
      setSnackbarMessage('Tu carrito está vacío. Añade productos para continuar.');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
  }, [cartItems.length]);

  // Resetear página cuando cambie el número de items
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [cartItems.length, currentPage, totalPages]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

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
        <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
          {/* Columna de productos dentro de un card del mismo tamaño */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              p: 3, 
              background: COLORS.background.gradient,
              borderRadius: 3,
              boxShadow: COLORS.shadows.heavy,
              border: `1px solid ${COLORS.primary.light}`,
              height: '600px', // Misma altura que el resumen
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                color: COLORS.primary.dark, 
                textAlign: 'center', 
                fontWeight: 700,
                mb: 3
              }}>
                Productos en tu Carrito
              </Typography>
              <Divider sx={{ my: 2, backgroundColor: COLORS.primary.light }} />
              
              {/* Contenedor con scroll para los productos */}
              <Box sx={{ 
                flexGrow: 1,
                overflowY: 'auto',
                pr: 1, // Padding para el scrollbar
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: COLORS.background.paper,
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: COLORS.primary.light,
                  borderRadius: '4px',
                  '&:hover': {
                    background: COLORS.primary.main,
                  },
                },
              }}>
                {currentItems.map((item) => (
                  <Card key={item.id} sx={{ 
                    display: 'flex', 
                    mb: 2, 
                    p: 2, 
                    ...CARD_STYLES.base,
                    ...CARD_STYLES.hover,
                    minHeight: '120px',
                    backgroundColor: COLORS.background.paper,
                    border: `1px solid ${COLORS.primary.light}`,
                  }}>
                    <CardMedia
                      component="img"
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        objectFit: 'contain', 
                        borderRadius: 1, 
                        mr: 2,
                        backgroundColor: COLORS.background.default,
                        p: 1,
                        flexShrink: 0
                      }}
                      image={item.imagenURL || "https://placehold.co/100x100/4a4a4a/f0f0f0?text=No+Image"}
                      alt={item.name}
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/4a4a4a/f0f0f0?text=Imagen+no+disponible"; }}
                    />
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      p: 0,
                      minWidth: 0,
                      overflow: 'hidden'
                    }}>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                          color: COLORS.text.primary,
                          fontWeight: 600,
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.2,
                          maxHeight: '2.4em',
                          wordBreak: 'break-word',
                          fontSize: '1rem'
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Precio Unitario: {formatPrice(item.price)}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: COLORS.primary.main,
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}>
                        Subtotal: {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      ml: 2,
                      gap: 2,
                      flexShrink: 0,
                      minWidth: '140px'
                    }}>
                      {/* Controles de cantidad con flechas arriba/abajo */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleIncrementQuantity(item)}
                          sx={{ 
                            color: COLORS.text.secondary,
                            '&:hover': { backgroundColor: 'rgba(212, 165, 165, 0.1)' },
                            padding: '2px'
                          }}
                        >
                          <KeyboardArrowUpIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          variant="outlined"
                          size="small"
                          value={item.quantity}
                          sx={{ 
                            width: 50, 
                            input: { 
                              textAlign: 'center', 
                              color: COLORS.text.primary,
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              padding: '4px 8px'
                            } 
                          }}
                          InputProps={{ readOnly: true }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => handleDecrementQuantity(item)}
                          sx={{ 
                            color: COLORS.text.secondary,
                            '&:hover': { backgroundColor: 'rgba(212, 165, 165, 0.1)' },
                            padding: '2px'
                          }}
                        >
                          <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {/* Botón de eliminar a la derecha */}
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
              </Box>
              
              {/* Paginación en la parte inferior del card */}
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${COLORS.primary.light}` }}>
                {totalPages > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 2
                  }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="medium"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: COLORS.text.primary,
                          '&.Mui-selected': {
                            backgroundColor: COLORS.primary.main,
                            color: COLORS.primary.contrastText,
                            '&:hover': {
                              backgroundColor: COLORS.primary.dark,
                            },
                          },
                          '&:hover': {
                            backgroundColor: COLORS.primary.light,
                          },
                        },
                      }}
                    />
                  </Box>
                )}
                
                {/* Información de paginación */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textAlign: 'center', 
                    color: COLORS.text.secondary
                  }}
                >
                  Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, cartItems.length)} de {cartItems.length} productos
                </Typography>
              </Box>
            </Card>
          </Grid>
          
          {/* Columna del resumen - mantiene el mismo diseño */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <Card sx={{ 
                p: 2,
                background: COLORS.background.gradient,
                borderRadius: 3,
                boxShadow: COLORS.shadows.heavy,
                border: `1px solid ${COLORS.primary.light}`,
                height: '600px',
                display: 'flex',
                flexDirection: 'column',
                width: '100%', // Fuerza el ancho completo
                minWidth: '300px' // Ancho mínimo para el resumen
              }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: COLORS.primary.dark, 
                  textAlign: 'center', 
                  fontWeight: 700,
                  mb: 1.5 // Reducido de 3 a 1.5
                }}>
                  Resumen del Pedido
                </Typography>
                <Divider sx={{ my: 1, backgroundColor: COLORS.primary.light }} /> {/* Reducido de my: 2 a my: 1 */}
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 2, // Reducido de 3 a 2
                  p: 1.5, // Reducido de 2 a 1.5
                  backgroundColor: '#ffffff', // Fondo blanco
                  borderRadius: 2,
                  border: `1px solid ${COLORS.primary.light}`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Sombra sutil
                }}>
                  <Typography variant="h6" sx={{ color: COLORS.primary.dark, fontWeight: 600 }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ color: COLORS.primary.main, fontWeight: 700 }}>
                    {formatPrice(getCartTotal())}
                  </Typography>
                </Box>

                {/* Información de Pago */}
                <Typography variant="h6" gutterBottom sx={{ 
                  color: COLORS.primary.dark, 
                  fontWeight: 600,
                  mb: 2
                }}>
                  Información de Pago
                </Typography>
                
                <TextField
                  fullWidth
                  label="Número de Tarjeta"
                  variant="outlined"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    label="MM/AA"
                    variant="outlined"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    sx={{ flex: 1 }}
                    required
                  />
                  <TextField
                    label="CVV"
                    variant="outlined"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    sx={{ flex: 1 }}
                    required
                  />
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={loadingCheckout || cartItems.length === 0}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    ...BUTTON_STYLES.primary,
                    mt: 'auto'
                  }}
                >
                  {loadingCheckout ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Finalizar Compra'
                  )}
                </Button>
              </Card>
            </Box>
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
