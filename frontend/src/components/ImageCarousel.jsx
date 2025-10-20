// src/components/ImageCarousel.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useTheme } from '@mui/material/styles';

const carouselItemSx = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: { xs: 200, sm: 300, md: 400 }, // Altura responsiva del slide
  color: 'primary.light',
  fontWeight: 900,
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden', // Oculta el desbordamiento de la imagen
  borderRadius: 12, // Bordes redondeados
};

const overlaySx = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(11, 11, 11, 0.63)', // Fondo semitransparente oscuro para el texto
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
  const theme = useTheme();
  const slides = [
    {
      id: 1,
      image: 'https://i.pinimg.com/736x/70/f3/6a/70f36a427e02f26b3333cefdbefaf16c.jpg',
      title: '¡Nuevas Figuras de Colección!',
      description: 'Descubre las últimas adiciones a tu colección favorita con descuentos exclusivos.',
      buttonText: 'Ver Figuras de Colección',
      link: '/products?categoryId=6' // Ejemplo de link a una categoría específica
    },
    {
      id: 2,
      image: 'https://i.pinimg.com/736x/09/5f/44/095f449c0269708344e9cd77c3fd36af.jpg',
      title: 'Cómics y Mangas con 20% OFF',
      description: 'Sumérgete en nuevas historias con nuestra selección de cómics y mangas a precios increíbles.',
      buttonText: 'Explorar Cómics',
      link: '/products?categoryId=3' // Ejemplo de link a otra categoría
    },
    {
      id: 3,
      image: 'https://i.pinimg.com/736x/56/3c/68/563c68a024301caeac320d8843d3777c.jpg',
      title: 'Ediciones Limitadas de cartas',
      description: 'No te pierdas las ediciones más raras de tus juegos preferidos. ¡Stock limitado!',
      buttonText: 'Ver Juegos y Coleccionables',
      link: '/products?categoryId=5' // Ejemplo de link a todos los productos products?category=5
    },
  ];

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
          '--swiper-theme-color': theme.palette.primary.main,        // bullets y barra
          '--swiper-pagination-color': theme.palette.primary.main,   // bullets
          '--swiper-navigation-color': theme.palette.primary.main,   // flechas
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
