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
      console.error('Error en checkout:', error);
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
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
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            {/* Columna de productos - Ancho fijo */}
            <Box sx={{ width: '65%', minWidth: '500px' }}>
              <Card sx={{ 
                p: 2, 
                background: COLORS.background.gradient,
                borderRadius: 3,
                boxShadow: COLORS.shadows.medium,
                height: '600px',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
              }}>
                <Typography variant="h5" sx={{ 
                  color: COLORS.primary.main, 
                  fontWeight: 700, 
                  mb: 1.5,
                  textAlign: 'center'
                }}>
                  Productos en tu Carrito
                </Typography>
                
                <Divider sx={{ mb: 1, borderColor: COLORS.primary.light }} />
                
                {/* Contenedor con scroll para productos */}
                <Box sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto',
                  pr: 1,
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
                          backgroundColor: COLORS.background.paper,
                          p: 1,
                          flexShrink: 0
                        }}
                        image={item.imagenPath || `https://placehold.co/100x100/${COLORS.primary.light.replace('#', '')}/f0f0f0?text=No+Image`}
                        alt={item.name}
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = `https://placehold.co/100x100/${COLORS.primary.light.replace('#', '')}/f0f0f0?text=Imagen+no+disponible`; 
                        }}
                      />
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 0,
                        minWidth: 0
                      }}>
                        {/* Información del producto */}
                        <Box sx={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          width: '100%'
                        }}>
                          <Box sx={{ 
                            flexGrow: 1, 
                            minWidth: 0,
                            mr: 2
                          }}>
                            <Typography 
                              variant="h6" 
                              component="div" 
                              sx={{ 
                                color: COLORS.text.primary,
                                fontWeight: 600,
                                mb: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {item.name}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ 
                              color: COLORS.text.secondary, 
                              mb: 0.5
                            }}>
                              Stock disponible: {item.stock}
                            </Typography>
                            
                            <Typography variant="h6" sx={{ 
                              color: COLORS.primary.main, 
                              fontWeight: 700
                            }}>
                              Subtotal: {formatPrice(item.price * item.quantity)}
                            </Typography>
                          </Box>
                          
                          {/* Botón eliminar */}
                          <IconButton
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            sx={{ 
                              color: COLORS.error,
                              '&:hover': { 
                                backgroundColor: COLORS.error + '20',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        
                        {/* Controles de cantidad */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          mt: 1
                        }}>
                          <IconButton
                            size="small"
                            onClick={() => handleDecrementQuantity(item)}
                            sx={{ 
                              color: COLORS.primary.main,
                              '&:hover': { backgroundColor: COLORS.primary.light + '20' },
                              p: 0.5
                            }}
                          >
                            <KeyboardArrowDownIcon fontSize="small" />
                          </IconButton>
                          
                          <TextField
                            value={item.quantity}
                            size="small"
                            inputProps={{ 
                              readOnly: true,
                              style: { 
                                textAlign: 'center', 
                                width: '40px',
                                padding: '4px 0',
                                fontSize: '0.9rem'
                              }
                            }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: COLORS.primary.light,
                                },
                              },
                              width: '60px'
                            }}
                          />
                          
                          <IconButton
                            size="small"
                            onClick={() => handleIncrementQuantity(item)}
                            disabled={item.quantity >= item.stock}
                            sx={{ 
                              color: COLORS.primary.main,
                              '&:hover': { backgroundColor: COLORS.primary.light + '20' },
                              p: 0.5
                            }}
                          >
                            <KeyboardArrowUpIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                
                {/* Paginación en la parte inferior del card */}
                {totalPages > 1 && (
                  <Box sx={{ 
                    mt: 1, 
                    pt: 1, 
                    borderTop: `1px solid ${COLORS.primary.light}`,
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: COLORS.text.secondary,
                      fontSize: '0.85rem'
                    }}>
                      Página {currentPage} de {totalPages}
                    </Typography>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="small"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: COLORS.primary.main,
                        },
                      }}
                    />
                  </Box>
                )}
              </Card>
            </Box>

            {/* Columna del resumen - Ancho fijo */}
            <Box sx={{ width: '35%', minWidth: '300px' }}>
              <Card sx={{ 
                p: 2, 
                backgroundColor: '#ffffff', // Fondo blanco
                borderRadius: 3,
                boxShadow: COLORS.shadows.medium,
                height: '600px',
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: 20,
                width: '100%',
                minWidth: '300px'
              }}>
                <Typography variant="h5" sx={{ 
                  color: COLORS.primary.main, 
                  fontWeight: 700, 
                  mb: 1.5,
                  textAlign: 'center'
                }}>
                  Resumen del Pedido
                </Typography>
                
                <Divider sx={{ mb: 1, borderColor: COLORS.primary.light }} />
                
                {/* Total */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 3,
                  p: 2,
                  backgroundColor: COLORS.background.paper,
                  borderRadius: 2,
                  border: `2px solid ${COLORS.primary.light}`
                }}>
                  <Typography variant="h6" sx={{ color: COLORS.text.primary, fontWeight: 600 }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ color: COLORS.primary.main, fontWeight: 700 }}>
                    {formatPrice(getCartTotal())}
                  </Typography>
                </Box>

                {/* Información de Pago */}
                <Typography variant="h6" gutterBottom sx={{ 
                  color: COLORS.primary.main, 
                  fontWeight: 600, 
                  mb: 2 
                }}>
                  Información de Pago
                </Typography>
                
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Número de Tarjeta"
                    variant="outlined"
                    fullWidth
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: COLORS.primary.light,
                        },
                        '&:hover fieldset': {
                          borderColor: COLORS.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: COLORS.primary.main,
                        },
                      },
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="MM/AA"
                      variant="outlined"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="12/25"
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: COLORS.primary.light,
                          },
                          '&:hover fieldset': {
                            borderColor: COLORS.primary.main,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: COLORS.primary.main,
                          },
                        },
                      }}
                    />
                    <TextField
                      label="CVV"
                      variant="outlined"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: COLORS.primary.light,
                          },
                          '&:hover fieldset': {
                            borderColor: COLORS.primary.main,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: COLORS.primary.main,
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Botón de Checkout */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  disabled={loadingCheckout}
                  sx={{ 
                    mt: 'auto',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    ...BUTTON_STYLES.primary,
                  }}
                >
                  {loadingCheckout ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Proceder al Pago'
                  )}
                </Button>
              </Card>
            </Box>
          </Box>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default CartPage;
