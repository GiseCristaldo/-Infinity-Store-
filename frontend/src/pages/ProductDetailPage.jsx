// src/pages/ProductDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Container, Grid, CardMedia, CardContent, Button, Snackbar, Chip,  TextField,IconButton,  
  List,
  ListItem,
  ListItemText,
  InputAdornment, } from '@mui/material'; 
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import MobileFilters from '../components/MobileFilters.jsx';
import { formatPrice, isValidPrice } from '../utils/priceUtils.js';
import { COLORS, BUTTON_STYLES, CARD_STYLES } from '../utils/colorConstants.js';

/**
 * Página de detalle de producto.
 * Muestra información detallada de un producto específico, permitiendo añadirlo al carrito.
 */
function ProductDetailPage() {
  const { id } = useParams(); // Obtiene el ID del producto de la URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Estados para carrusel de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Estados para snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Estados para mensajes
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messages, setMessages] = useState([]);

  const { addToCart, cartItems } = useCart();
  const { isAuthenticated } = useAuth();
  
  // Use dynamic theme
  const { currentSettings } = useTheme();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/products/${id}`);
        setProduct(response.data);
        // Resetear el índice de imagen cuando se carga un nuevo producto
        setCurrentImageIndex(0);
      } catch (err) {
        console.error('Error al obtener el producto:', err);
        setError('No se pudo cargar el producto. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = (productToAdd) => {
    if (productToAdd.stock === 0) {
        setSnackbarMessage(`"${productToAdd.name}" está agotado.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }

    const itemInCart = cartItems.find(item => item.id === productToAdd.id);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;

    if (currentQuantityInCart + 1 > productToAdd.stock) {
        setSnackbarMessage(`No puedes añadir más de "${productToAdd.name}". Stock disponible: ${productToAdd.stock}.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }

    addToCart(productToAdd, 1);
    setSnackbarMessage(`"${productToAdd.name}" añadido al carrito.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    if (categoryId) {
      navigate(`/category/${categoryId}`);
    } else {
      navigate('/products');
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Funciones para el carrusel de imágenes
  const handlePreviousImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  // Obtener la imagen actual para mostrar
  const getCurrentImage = () => {
    if (product?.images && product.images.length > 0) {
      return product.images[currentImageIndex]?.url || product.imagenPath;
    }
    return product?.imagenPath || "https://placehold.co/600x400/4a4a4a/f0f0f0?text=No+Image";
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando producto...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
            Volver al Catálogo
        </Button>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Producto no disponible.</Typography>
        <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
            Volver al Catálogo
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ 
      py: 4,
      minHeight: '100vh',
      background: currentSettings?.color_palette ? 
        `linear-gradient(135deg, ${currentSettings.color_palette.accent_color}10 0%, ${currentSettings.color_palette.secondary_color}05 100%)` :
        'transparent'
    }}>
      {/* Filtros desktop/tablet */}
      <Box sx={{ mb: 4, display: { xs: 'none', sm: 'block' } }}>
        <CategoryFilter
          onSelectCategory={handleSelectCategory}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
        />
      </Box>
      {/* Filtros móviles */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 2 }}>
        <MobileFilters selectedCategoryId={selectedCategoryId} onSelectCategory={handleSelectCategory} />
      </Box>

      <Grid container spacing={4} sx={{ 
        display: 'grid !important',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 4,
        alignItems: 'start',
        minHeight: '600px'
      }}>
        {/* Columna izquierda: Imágenes del producto */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Imagen Principal */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: { xs: '350px', md: '500px', lg: '600px' },
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                border: currentSettings?.color_palette ? 
                  `2px solid ${currentSettings.color_palette.accent_color}40` :
                  '1px solid #e0e0e0',
                boxShadow: currentSettings?.color_palette ? 
                  `0 8px 24px ${currentSettings.color_palette.primary_color}15` :
                  '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: currentSettings?.color_palette ? 
                    `0 12px 32px ${currentSettings.color_palette.primary_color}25` :
                    '0 8px 20px rgba(0,0,0,0.15)',
                }
              }}
            >
              {product.ofert && (
                <Chip
                  label="¡OFERTA!"
                  color="secondary"
                  size="medium"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    zIndex: 1,
                    backgroundColor: COLORS.error,
                    color: COLORS.primary.contrastText,
                  }}
                />
              )}
              
              {/* Botones de navegación del carrusel */}
              {product?.images && product.images.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePreviousImage}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      zIndex: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                  >
                    <ArrowBackIosIcon />
                  </IconButton>
                  
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      zIndex: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </>
              )}
              
              <img
                src={getCurrentImage()}
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  padding: '16px',
                }}
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/4a4a4a/f0f0f0?text=Imagen+no+disponible"; }}
              />
              
              {/* Indicador de imagen actual */}
              {product?.images && product.images.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    zIndex: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'white', fontSize: '0.875rem' }}>
                    {currentImageIndex + 1} / {product.images.length}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Miniaturas */}
            {product?.images && product.images.length > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  pb: 1,
                  '&::-webkit-scrollbar': {
                    height: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: 3,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: COLORS.primary.main,
                    borderRadius: 3,
                  },
                }}
              >
                {product.images.map((image, index) => (
                  <Box
                    key={image.id || index}
                    onClick={() => handleThumbnailClick(index)}
                    sx={{
                      minWidth: 80,
                      height: 80,
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: currentImageIndex === index ? `3px solid ${COLORS.primary.main}` : '2px solid transparent',
                      transition: 'border-color 0.2s ease',
                      '&:hover': {
                        border: `3px solid ${COLORS.primary.light}`,
                      },
                    }}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} - imagen ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/4a4a4a/f0f0f0?text=No+Image"; }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Columna Derecha: Detalles del Producto */}
        <Grid item sx={{ 
          gridColumn: { xs: '1', md: '2' }
        }}>
          <Box sx={{ 
            p: { xs: 2, md: 3, lg: 4 }, 
            ...CARD_STYLES.base,
            width: '100%',
            minHeight: { xs: '350px', md: '500px', lg: '600px' },
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: 2,
          }}>
            {/* Título del producto */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
              color: currentSettings?.color_palette?.text_color || '#333333', 
              fontWeight: 700,
              mb: 3,
              textAlign: 'left',
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
            }}>
              {product.name}
            </Typography>
            
            {/* Categoría */}
            <Box sx={{ 
              backgroundColor: currentSettings?.color_palette ? 
                `${currentSettings.color_palette.accent_color}20` :
                'rgba(0,0,0,0.05)',
              borderRadius: 2,
              p: 1.5,
              mb: 2,
              textAlign: 'center',
              border: currentSettings?.color_palette ? 
                `1px solid ${currentSettings.color_palette.accent_color}40` :
                '1px solid #e0e0e0',
            }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  fontFamily: '"Orbitron", sans-serif',
                  color: '#7e57c2',
                }}
              >
                <b>Categoría:</b> {product.category ? product.category.name : 'N/A'}
              </Typography>
            </Box>
            
            {/* Descripción - NO CAMBIA DE POSICIÓN */}
            <Box sx={{ 
              backgroundColor: currentSettings?.color_palette ? 
                `${currentSettings.color_palette.accent_color}15` :
                'rgba(0,0,0,0.05)',
              borderRadius: 2,
              p: 2,
              mb: 3,
              flexGrow: 1, // Toma el espacio disponible
              minHeight: '120px', // Altura mínima para consistencia
              display: 'flex',
              alignItems: 'flex-start', // Alinea el texto al inicio
              border: currentSettings?.color_palette ? 
                `1px solid ${currentSettings.color_palette.accent_color}30` :
                '1px solid #e0e0e0',
            }}>
              <Typography variant="body1" sx={{ 
                lineHeight: 1.6,
                fontSize: '1.1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: currentSettings?.color_palette?.text_color || '#666666',
              }}>
                {product.description}
              </Typography>
            </Box>

            {/* Stock */}
            <Box sx={{ 
              backgroundColor: product.stock > 0 ? 'rgba(165, 212, 165, 0.2)' : 'rgba(212, 165, 165, 0.2)',
              borderRadius: 2,
              p: 1.5,
              mb: 3,
              textAlign: 'center',
              border: `2px solid ${product.stock > 0 ? COLORS.success : COLORS.error}`,
            }}>
              <Typography variant="body1" color={product.stock > 0 ? '#5d7a5d' : '#7a5d5d'} sx={{ 
                fontWeight: 600,
                fontSize: '1.1rem',
              }}>
                Stock: {product.stock > 0 ? product.stock : 'Agotado'}
              </Typography>
            </Box>

            {/* Precio: soporta número (formateado) o string ya formateado desde backend */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ 
                color: currentSettings?.color_palette?.primary_color || '#d4a5a5', 
                fontWeight: 'bold', 
                mb: 1 
              }}>
                {typeof product.price === 'number' ? formatPrice(product.price) : (product.price || formatPrice(0))}
              </Typography>
            </Box>

            {/* Botones */}
            <Box sx={{ mt: 'auto' }}>
              <Button
                variant="contained"
                fullWidth
                disabled={product.stock === 0}
                onClick={() => handleAddToCart(product)}
                sx={{ 
                  mb: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  backgroundColor: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                  color: '#ffffff',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: currentSettings?.color_palette?.secondary_color || '#c9a9a9',
                    transform: 'translateY(-2px)',
                    boxShadow: currentSettings?.color_palette ? 
                      `0 6px 16px ${currentSettings.color_palette.primary_color}40` :
                      '0 6px 16px rgba(0,0,0,0.2)',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    color: '#999',
                  },
                }}
              >
                {product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/products"
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderColor: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                  color: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: currentSettings?.color_palette?.secondary_color || '#c9a9a9',
                    backgroundColor: currentSettings?.color_palette ? 
                      `${currentSettings.color_palette.accent_color}20` :
                      'rgba(212, 165, 165, 0.1)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Volver al Catálogo
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar para notificaciones */}
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
    </Container>
  );
}

export default ProductDetailPage;
