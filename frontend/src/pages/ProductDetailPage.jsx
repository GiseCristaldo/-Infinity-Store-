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
  navigate('/login');
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
          <Box sx={{ p: { xs: 1, sm: 2 }, backgroundColor: 'background.paper', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'secondary.main', fontWeight: 700 }}>
              {product.name}
            </Typography>
            {/* Categoría: Estilos con Orbitron y color secundario.light */}
            <Typography
                variant="body1"
                color="secondary.light"
                sx={{
                    mb: 2,
                    fontWeight: 600,
                    fontFamily: '"Orbitron", sans-serif',
                }}
            >
                <b>Categoría:</b> {product.category ? product.category.name : 'N/A'}
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ mb: 3 }}>
              {product.description}
            </Typography>

            <Typography variant="body2" color={product.stock > 0 ? 'text.secondary' : 'error.main'} sx={{ mb: 3 }}>
              Stock: {product.stock > 0 ? product.stock : 'Agotado'}
            </Typography>

            <Button
              variant="contained"
              color="primary" // Changed to primary for contrast
              fullWidth
              disabled={product.stock === 0}
              onClick={() => handleAddToCart(product)}
              sx={{ mb: 2 }}
            >
              Añadir al Carrito
            </Button>

            <Button
              variant="outlined"
              color="secondary" // Changed to secondary for contrast
              fullWidth
              component={Link}
              to="/products" // Enlace para volver al catálogo general
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
