// src/components/ImageCarousel.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme as useCustomTheme } from '../context/ThemeContext.jsx';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import axios from 'axios';

const carouselItemSx = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: { xs: 200, sm: 300, md: 400 },
  color: 'primary.light',
  fontWeight: 900,
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 12,
};

const overlaySx = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(11, 11, 11, 0.63)',
  zIndex: 1,
};

const contentSx = {
  position: 'relative',
  zIndex: 2,
  p: { xs: 2, sm: 3, md: 4 },
  maxWidth: { xs: '90%', md: '70%' },
};

/**
 * Componente de Carrusel de Imágenes para la página de inicio.
 * Utiliza Swiper.js para mostrar slides con ofertas o mensajes destacados.
 */
function ImageCarousel() {
  const muiTheme = useMuiTheme();
  const { currentSettings } = useCustomTheme();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Slides por defecto como fallback
  const defaultSlides = [
    {
      id: 1,
      image: 'https://i.pinimg.com/736x/70/f3/6a/70f36a427e02f26b3333cefdbefaf16c.jpg',
      title: '¡Nuevas Figuras de Colección!',
      description: 'Descubre las últimas adiciones a tu colección favorita con descuentos exclusivos.',
      buttonText: 'Ver Figuras de Colección',
      link: '/products?categoryId=6'
    },
    {
      id: 2,
      image: 'https://i.pinimg.com/736x/09/5f/44/095f449c0269708344e9cd77c3fd36af.jpg',
      title: 'Cómics y Mangas con 20% OFF',
      description: 'Sumérgete en nuevas historias con nuestra selección de cómics y mangas a precios increíbles.',
      buttonText: 'Explorar Cómics',
      link: '/products?categoryId=3'
    },
    {
      id: 3,
      image: 'https://i.pinimg.com/736x/56/3c/68/563c68a024301caeac320d8843d3777c.jpg',
      title: 'Ediciones Limitadas de cartas',
      description: 'No te pierdas las ediciones más raras de tus juegos preferidos. ¡Stock limitado!',
      buttonText: 'Ver Juegos y Coleccionables',
      link: '/products?categoryId=5'
    },
  ];

  useEffect(() => {
    loadCarouselImages();
  }, [currentSettings]); // Se actualiza cuando cambian las configuraciones

  const buildAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${url}`;
  };

  const toSlides = (images) => {
    return images.map((imageData, index) => {
      const imageUrl = typeof imageData === 'string' ? imageData : imageData.image;
      const imageTitle = typeof imageData === 'object' && imageData.title ? imageData.title : `Slide ${index + 1}`;
      const imageSubtitle = typeof imageData === 'object' && imageData.subtitle ? imageData.subtitle : 'Descubre nuestros productos destacados';

      return {
        id: index + 1,
        image: buildAbsoluteUrl(imageUrl),
        title: imageTitle,
        description: imageSubtitle,
        buttonText: 'Ver Productos',
        link: '/products'
      };
    });
  };

  const loadCarouselImages = async () => {
    try {
      setLoading(true);
      console.log('🎠 [ImageCarousel] Cargando imágenes...');

      // Limpiar caché y cargar siempre desde la API para asegurar datos frescos
      console.log('🧹 [ImageCarousel] Limpiando caché...');
      localStorage.removeItem('themeSettings');
      localStorage.removeItem('themeSettingsTimestamp');

      // 1) Intentar con el nuevo endpoint público del carrusel
      console.log('📡 [ImageCarousel] Intentando /api/carousel-new/public...');
      try {
        const respNew = await axios.get('/api/carousel-new/public', {
          params: { _ts: Date.now() },
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        const imagesNew = respNew.data?.data || [];
        console.log('📡 [ImageCarousel] Nuevo carrusel:', imagesNew);
        if (Array.isArray(imagesNew) && imagesNew.length > 0) {
          setSlides(toSlides(imagesNew));
          return;
        }
      } catch (e) {
        console.warn('⚠️ [ImageCarousel] Falló /api/carousel-new/public, se usará fallback:', e?.message || e);
      }

      // 2) Fallback al endpoint de settings actual
      console.log('📡 [ImageCarousel] Cargando /api/settings/current como fallback...');
      const response = await axios.get('/api/settings/current', {
        params: { _ts: Date.now() },
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const carouselImages = response.data.data?.carousel_images || [];
      console.log('📡 [ImageCarousel] Imágenes recibidas (settings):', carouselImages);

      if (carouselImages.length > 0) {
        setSlides(toSlides(carouselImages));
      } else {
        setSlides(defaultSlides);
      }
    } catch (error) {
      console.error('Error loading carousel images:', error);
      setError(error);
      // Usar slides por defecto en caso de error
      setSlides(defaultSlides);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        width: '100vw', 
        mx: 'calc(-50vw + 50%)', 
        height: { xs: 200, sm: 300, md: 400 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'grey.100'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <Box sx={{ 
        width: '100vw', 
        mx: 'calc(-50vw + 50%)', 
        height: { xs: 200, sm: 300, md: 400 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'grey.100'
      }}>
        <Typography variant="h6" color="text.secondary">
          No hay imágenes de carousel configuradas
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100vw', mx: 'calc(-50vw + 50%)', overflow: 'hidden' }}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        style={{
          width: '100%',
          height: '100%',
          '--swiper-theme-color': muiTheme.palette.primary.main,
          '--swiper-pagination-color': muiTheme.palette.primary.main,
          '--swiper-navigation-color': muiTheme.palette.primary.main,
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <Box
              sx={{
                ...carouselItemSx,
                borderRadius: 0,
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <Box sx={overlaySx} />
              <Box sx={contentSx}>
                <Typography variant="h2" component="h2" gutterBottom sx={{ color: 'secondary.light', fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                  lineHeight: 1.2,
                }}>
                  {slide.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, fontSize: { xs: '0.85rem', sm: '1rem', md: '1.15rem', lg: '1.25rem' }}}>
                  {slide.description}
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to={slide.link}
                  color="primary"
                  sx={{
                    px: { xs: 1.5, sm: 3 },
                    py: { xs: 0.6, sm: 1.2 },
                    fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem' },
                    fontWeight: 600,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(212, 165, 165, 0.4)',
                    },
                  }}
                >
                  {slide.buttonText}
                </Button>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}

export default ImageCarousel;
