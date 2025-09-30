// src/pages/ProductDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Container, Grid, CardMedia, CardContent, Button, Snackbar, Chip,  TextField,IconButton,  
  List,
  ListItem,
  ListItemText,
  InputAdornment, } from '@mui/material'; 
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:3001/api/products/${id}`);
        setProduct(response.data);
        if (response.data && response.data.categoryId) {
            setSelectedCategoryId(response.data.categoryId);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        if (err.response && err.response.status === 404) {
          setError('Producto no encontrado.');
        } else {
          setError('No se pudo cargar el producto. Inténtalo de nuevo más tarde.');
        }
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
    if (categoryId) {
        navigate(`/products?category=${categoryId}`);
    } else {
        navigate('/products');
    }
  };
const handleSendMessage = async () => {
  if (!newMessageText.trim()){
    return;
  }
if (!isAuthenticated){
  navigate('/auth');
  return
}
setSendingMessage(true);
try {
  await axios.post(`http://localhost:3001/api/products/${id}/messages`, {
    text: newMessageText,
  }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  setNewMessageText('');
  fetchData();
} catch(err){
  console.error('Error al enviar el mensaje:', err);
} finally {
  setSendingMessage(false);
}
};

const fetchData = async () => {
  try {
    const response = await axios.get(`http://localhost:3001/api/products/${id}/messages`);
    setMessages(response.data || []);
  } catch (err) {
    console.error('Error fetching messages:', err);
  }
};

const handleSnackbarClose = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }
  setSnackbarOpen(false);
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
   // Calcula el precio con descuento
  const discountedPrice = product.ofert && product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;

    return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Chips de Categorías en la parte superior */}
      <Box sx={{ mb: 4 }}>
        <CategoryFilter
          onSelectCategory={handleSelectCategory}
          selectedCategoryId={selectedCategoryId}
        />
      </Box>

      <Grid container spacing={4} sx={{ display: 'flex', justifyContent: 'center' }}>
        {/* Columna Izquierda: Imagen del Producto */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: { xs: '300px', sm: '400px', md: '500px' }, // Altura responsiva para la imagen
              backgroundColor: 'background.paper',
              borderRadius: 2,
              overflow: 'hidden', // Asegura que la imagen no se salga del contenedor
              position: 'relative', // Para posicionar el chip de oferta
            }}
          >
            {product.ofert && (
              <Chip
                label="¡OFERTA!"
                color="secondary"
                size="medium" // Tamaño un poco más grande para el detalle
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  zIndex: 1,
                }}
              />
            )}
            <img
              src={product.imagenURL || "https://placehold.co/600x400/4a4a4a/f0f0f0?text=No+Image"}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain', // Asegura que la imagen se ajuste sin recortarse
              }}
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/4a4a4a/f0f0f0?text=Imagen+no+disponible"; }}
            />
          </Box>
        </Grid>

        {/* Columna Derecha: Detalles del Producto */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: { xs: 3, sm: 4 }, 
            background: 'linear-gradient(135deg, #f8f4f4, #f0e8e8)',
            borderRadius: 3,
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(212, 165, 165, 0.15)',
            border: '1px solid rgba(212, 165, 165, 0.2)',
          }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
              color: '#5d4e4e', 
              fontWeight: 700,
              mb: 3,
              textAlign: 'left',
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
            }}>
              {product.name}
            </Typography>
            
            {/* Categoría con nuevo diseño */}
            <Box sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              p: 1.5,
              mb: 2,
              textAlign: 'center',
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
            
            {/* Descripción con mejor formato */}
            <Box sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              p: 2,
              mb: 3,
              flexGrow: 1,
            }}>
              <Typography variant="body1" color="#333333" sx={{ 
                lineHeight: 1.6,
                fontSize: '1.1rem',
              }}>
                {product.description}
              </Typography>
            </Box>

            {/* Stock con mejor visualización */}
            <Box sx={{ 
              backgroundColor: product.stock > 0 ? 'rgba(165, 212, 165, 0.2)' : 'rgba(212, 165, 165, 0.2)',
              borderRadius: 2,
              p: 1.5,
              mb: 3,
              textAlign: 'center',
              border: `2px solid ${product.stock > 0 ? '#a5d4a5' : '#d4a5a5'}`,
            }}>
              <Typography variant="body1" color={product.stock > 0 ? '#5d7a5d' : '#7a5d5d'} sx={{ 
                fontWeight: 600,
                fontSize: '1.1rem',
              }}>
                Stock: {product.stock > 0 ? product.stock : 'Agotado'}
              </Typography>
            </Box>

            {/* Precios con el nuevo diseño */}
            <Box sx={{ mb: 3 }}>
              {product.ofert && product.discount > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', mb: 1 }}>
                  Precio original: ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || 0).toFixed(2)}
                </Typography>
              )}
              <Typography variant="h4" sx={{ color: '#d4a5a5', fontWeight: 'bold', mb: 1 }}>
                ${product.ofert && product.discount > 0 
                  ? (typeof discountedPrice === 'number' ? discountedPrice.toFixed(2) : parseFloat(discountedPrice || 0).toFixed(2))
                  : (typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || 0).toFixed(2))
                }
              </Typography>
              {product.ofert && product.discount > 0 && (
                <Typography variant="body1" sx={{ color: '#a5d4a5', fontWeight: 600 }}>
                  ¡Ahorra ${(typeof product.price === 'number' ? product.price : parseFloat(product.price || 0)) - (typeof discountedPrice === 'number' ? discountedPrice : parseFloat(discountedPrice || 0)).toFixed(2)}!
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              fullWidth
              disabled={product.stock === 0}
              onClick={() => handleAddToCart(product)}
              sx={{ 
                mb: 2,
                backgroundColor: '#d4a5a5',
                color: '#ffffff',
                fontWeight: 600,
                borderRadius: 2,
                py: 1.5,
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#e8c4c4',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(212, 165, 165, 0.4)',
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
                borderColor: '#d4a5a5',
                color: '#d4a5a5',
                fontWeight: 600,
                borderRadius: 2,
                py: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#e8c4c4',
                  backgroundColor: 'rgba(212, 165, 165, 0.1)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Volver al Catálogo
            </Button>
          </Box>
        </Grid>
      </Grid>

    </Container>
  );
}

export default ProductDetailPage;
