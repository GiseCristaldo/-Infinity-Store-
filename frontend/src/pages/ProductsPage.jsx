// src/pages/ProductsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Box, Grid, Card, CardContent, CardMedia, Button, CircularProgress, Alert, Snackbar, Chip } from '@mui/material';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import CategoryFilter from '../components/CategoryFilter.jsx';

import { useCart } from '../context/CartContext.jsx'; // <-- Importa el hook useCart

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { addToCart, cartItems } = useCart(); // <-- Obtén addToCart y cartItems del contexto
  const [paginationInfo, setPaginationInfo] = useState(null);

  // Estados para el Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const initialCategoryId = searchParams.get('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId || null);

  const fetchProducts = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      // Construimos la URL base
      let url = 'http://localhost:3001/api/products';
      
      // Creamos un objeto para los parámetros de la URL
      const params = new URLSearchParams();
      if (categoryId) {
        params.append('category', categoryId);
      }
      // Aquí podrías añadir parámetros de paginación en el futuro, ej: params.append('page', 1);
      
      // Unimos la URL con los parámetros
      const finalUrl = `${url}?${params.toString()}`;

      const response = await axios.get(finalUrl);
      
      // El backend ahora devuelve un objeto: { products: [...], totalPages: X, ... }
      // Por eso, extraemos el array de la propiedad 'products'.
      setProducts(response.data.products);

      // También guardamos la información de paginación que nos envía el backend
      setPaginationInfo({
        totalItems: response.data.totalItems,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
      });

    } catch (err) {
      console.error('Error al obtener productos:', err);
      setError('No se pudieron cargar los productos. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategoryId);

    if (selectedCategoryId) {
      setSearchParams({ category: selectedCategoryId });
    } else {
      setSearchParams({});
    }
  }, [fetchProducts, selectedCategoryId, setSearchParams]);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  // Función para añadir al carrito (usando el contexto)
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

    addToCart(productToAdd, 1); // Llama a la función del contexto
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
        <Typography sx={{ ml: 2 }}>Cargando productos...</Typography>
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', color: 'secondary.main' }}>
        Nuestro Catálogo Geek
      </Typography>

      <CategoryFilter
        onSelectCategory={handleSelectCategory}
        selectedCategoryId={selectedCategoryId}
      />

      {products.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">No hay productos disponibles para esta categoría por el momento.</Typography>
        </Box>
      ) : (
        // Contenedor principal para las tarjetas de producto usando Flexbox
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap', // Permite que los elementos se envuelvan a la siguiente línea
            gap: 4, // Espacio entre las tarjetas (equivalente a spacing en Grid)
            justifyContent: 'center', // Centra las tarjetas horizontalmente
            alignItems: 'stretch', // Asegura que las tarjetas se estiren a la misma altura
          }}
        > 
          {products.map((product) => {
            const discountedPrice = product.oferta && product.descuento > 0
              ? product.price * (1 - product.descuento / 100)
              : product.price;

            return (
              // Cada tarjeta de producto ahora es un Box o directamente el Card
              <Card 
                key={product.id} 
                sx={{
                  // Define el ancho de cada tarjeta para responsive
                  // Ajusta estos valores según la cantidad de columnas que quieras por breakpoint
                  flexBasis: { 
                    xs: '100%', // 1 columna en pantallas extra-pequeñas
                    sm: 'calc(50% - 16px)', // 2 columnas en pantallas pequeñas (50% - gap)
                    md: 'calc(33.333% - 21.333px)', // 3 columnas en pantallas medianas (33.333% - gap)
                    lg: 'calc(25% - 24px)', // 4 columnas en pantallas grandes (25% - gap)
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
                    image={product.imagenURL || "https://placehold.co/400x200/4a4a4a/f0f0f0?text=No+Image"}
                    alt={product.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x200/4a4a4a/f0f0f0?text=Imagen+no+disponible"; }}
                    sx={{
                      height: '200px', // Altura fija para las imágenes
                      objectFit: 'contain',
                      p: 2, // Padding de la imagen
                      backgroundColor: 'background.default'
                    }}
                  />
                  <CardContent sx={{
                    flexGrow: 1, // CardContent toma el espacio vertical restante
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start', // Alinea el contenido de CardContent al inicio
                    px: 2,
                    pb: 1, // Pequeño padding bottom para separar del Box de botones
                  }}>
                    {/* Título: Aseguramos 2 líneas y truncamos si es más largo */}
                    <Typography gutterBottom variant="h6" component="h2" sx={{
                      color: 'text.primary',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      mb: 1,
                      minHeight: '2.2em', // Altura mínima para asegurar 2 líneas (aprox.)
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2, // Limita el título a 2 líneas
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {product.name}
                    </Typography>
                    {/* Descripción: Limita caracteres y añade "..." con WebkitLineClamp para líneas */}
                    <Typography variant="body2" color="text.secondary" sx={{
                      mb: 1, // Margen inferior para separar del precio
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 4, // Limita la descripción a 4 líneas visuales
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {/* Aplica substring y añade "..." si la descripción es más larga */}
                      {product.description.length > 150
                        ? product.description.substring(0, 150) + '...'
                        : product.description}
                    </Typography>
                    {/* Precios: Original tachado y nuevo con descuento */}
                    <Box sx={{ mt: 'auto' }}>
                      {product.ofert && product.discount > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          ${product.price.toFixed(2)}
                        </Typography>
                      )}
                      <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || 0).toFixed(2)}
                      </Typography>
                      {product.discount > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          ${typeof discountedPrice === 'number' ? discountedPrice.toFixed(2) : parseFloat(discountedPrice || 0).toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" color={product.stock > 0 ? 'text.secondary' : 'error.main'}>
                      Stock: {product.stock > 0 ? product.stock : 'Agotado'}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, height: '100px' }}> {/* Contenedor para los botones con altura fija ajustada */}
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
    </Box>
  );
}

export default ProductsPage;