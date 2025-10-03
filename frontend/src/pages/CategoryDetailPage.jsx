// src/pages/CategoryDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Container, Grid, Card, CardMedia, CardContent, Button, Snackbar, Chip } from '@mui/material';
import axios from 'axios';

import { useCart } from '../context/CartContext.jsx'; // importamos el contexto del carrito

/**
 * Página que muestra los productos de una categoría específica.
 * Obtiene el ID de la categoría de la URL.
 */
function CategoryDetailPage() {
  const { id } = useParams();
  const [categoryName, setCategoryName] = useState('Categoría');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { addToCart, cartItems } = useCart(); // <-- traemos las funciones y el estado del carrito del contexto

  // Estados para el Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');


  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoryResponse = await axios.get(`http://localhost:3001/api/categories/${id}`);
        setCategoryName(categoryResponse.data.name);

        const productsResponse = await axios.get(`http://localhost:3001/api/products?category=${id}`);
        // El backend ahora devuelve un objeto con la propiedad 'products'
        const productsArray = productsResponse.data.products || productsResponse.data;
        setProducts(Array.isArray(productsArray) ? productsArray.filter(p => p.active) : []); // Aca me aseguro de mostrar solo productos activos
      } catch (err) {
        console.error('Error al cargar la categoría o sus productos:', err);
        setError('No se pudo cargar la categoría o sus productos. Inténtalo de nuevo.');
        if (err.response && err.response.status === 404) {
          setCategoryName('Categoría Desconocida');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [id]);

  // Función para añadir al carrito (ahora usamos el contexto)
  const handleAddToCart = (productToAdd) => {
    // Validación de stock (HU3.1.2)
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

    addToCart(productToAdd, 1); // Llama a la función addToCart del contexto
    setSnackbarMessage(`"${productToAdd.name}" añadido al carrito.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // Handler para cerrar el Snackbar
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
        <Typography sx={{ ml: 2 }}>Cargando productos de {categoryName}...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, color: 'secondary.main' }}>
        Productos de {categoryName}
      </Typography>

      {products.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">No hay productos disponibles en esta categoría por el momento.</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap', // Permite que los elementos se envuelvan a la siguiente línea
            gap: 4, // Espacio entre las tarjetas
            justifyContent: 'center', // Centra las tarjetas horizontalmente
            alignItems: 'stretch', // Asegura que las tarjetas se estiren a la misma altura
          }}
        >
          {products.map((product) => {
            return (
              <Card
                key={product.id}
                sx={{
                  // Define el ancho de cada tarjeta para responsive
                  flexBasis: {
                    xs: '100%', // 1 columna en pantallas extra-pequeñas
                    sm: 'calc(50% - 16px)', // 2 columnas en pantallas pequeñas (50% - gap/2*2 = 50% - gap)
                    md: 'calc(33.333% - 21.333px)', // 3 columnas en pantallas medianas (33.333% - gap/3*2 = 33.333% - gap * 2/3)
                    lg: 'calc(25% - 24px)', // 4 columnas en pantallas grandes (25% - gap/4*3 = 25% - gap * 3/4)
                  },
                  maxWidth: { // Evita que crezcan demasiado si hay pocos items
                    xs: '100%',
                    sm: 'calc(50% - 16px)',
                    md: 'calc(33.333% - 21.333px)',
                    lg: 'calc(25% - 24px)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'background.paper',
                  height: '520px', // Altura fija para toda la Card
                  borderRadius: 2,
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                  {product.ofert && (
                    <Chip
                      label="¡OFERTA!"
                      color="secondary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 'bold',
                        zIndex: 1,
                      }}
                    />
                  )}
                  <CardMedia
                    component="img"
                    sx={{
                      height: '200px', // Altura fija para las imágenes
                      objectFit: 'contain',
                      p: 2,
                      backgroundColor: 'background.default'
                    }}
                    image={product.imagenPath || "https://placehold.co/400x200/4a4a4a/f0f0f0?text=No+Image"}
                    alt={product.name}
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x200/4a4a4a/f0f0f0?text=Imagen+no+disponible"; }}
                  />
                  <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    px: 2,
                    pb: 1,
                  }}>
                    <Typography gutterBottom variant="h6" component="h2" sx={{
                      color: 'text.primary',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      mb: 1,
                      minHeight: '2.2em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {product.description.length > 150
                        ? product.description.substring(0, 150) + '...'
                        : product.description}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                        {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : `$${parseFloat(product.price || 0).toFixed(2)}`}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color={product.stock > 0 ? 'text.secondary' : 'error.main'}>
                      Stock: {product.stock > 0 ? product.stock : 'Agotado'}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, height: '100px' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{
                        mb: 1,
                        backgroundColor: '#d4a5a5',
                        color: '#ffffff',
                        fontWeight: 600,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#e8c4c4',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(212, 165, 165, 0.3)',
                        },
                      }}
                      component={Link}
                      to={`/product/${product.id}`}
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={product.stock === 0}
                      onClick={() => handleAddToCart(product)}
                      sx={{
                        borderColor: '#d4a5a5',
                        color: '#d4a5a5',
                        fontWeight: 600,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#e8c4c4',
                          backgroundColor: 'rgba(212, 165, 165, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                          borderColor: '#ccc',
                          color: '#999',
                        },
                      }}
                    >
                      Añadir al Carrito
                    </Button>
                  </Box>
              </Card>
            );
          })}
        </Box>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
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

export default CategoryDetailPage;