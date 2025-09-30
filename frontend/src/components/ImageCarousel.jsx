// src/components/ImageCarousel.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules'; // Importa módulos necesarios
import 'swiper/css'; // Estilos base de Swiper
import 'swiper/css/pagination'; // Estilos para la paginación (los puntos de abajo)
import 'swiper/css/navigation'; // Estilos para las flechas de navegación

// Estilos personalizados para el carrusel si Material UI no es suficiente
const carouselItemSx = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: { xs: 200, sm: 300, md: 400 }, // Altura responsiva del slide
  color: 'white',
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
    <Box sx={{ my: 4, borderRadius: 10, overflow: 'hidden' }}> {/* Contenedor principal con bordes redondeados */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0} // Espacio entre slides
        slidesPerView={1} // Muestra 1 slide a la vez
        autoplay={{
          delay: 5000, // Cada 5 segundos cambia de slide
          disableOnInteraction: false, // El autoplay no se detiene al interactuar
        }}
        pagination={{ clickable: true }} // Paginación con puntos clicables
        navigation={true} // Flechas de navegación
        loop={true} // Carrusel infinito
        style={{ '--swiper-pagination-color': '#f20278', '--swiper-navigation-color': '#f20278', '--swiper-navigation-size': '24px', // <-- Tamaño de las flechas (por ejemplo, 24px)
          '--swiper-pagination-bullet-width': '8px', // <-- Ancho de los puntos
          '--swiper-pagination-bullet-height': '8px', // <-- Altura de los puntos
          '--swiper-pagination-bullet-inactive-opacity': '0.5', }} // Colores de paginación/navegación
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <Box sx={{ ...carouselItemSx, backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <Box sx={overlaySx} />
              <Box sx={contentSx}>
                <Typography variant="h2" component="h2" gutterBottom sx={{ color: 'primary.ligth', fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '2rem', md: '2.5rem', lg: '3rem' }, // Font size responsivo para el título
                  lineHeight: 1.2, // Ajustar line-height para el responsive
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
                  sx={{
                    px: { xs: 1.5, sm: 3 }, // Padding horizontal responsivo del botón
                    py: { xs: 0.6, sm: 1.2 }, // Padding vertical responsivo del botón
                    fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem' }, // Font size responsivo del botón
                    backgroundColor: '#d4a5a5',
                    color: '#ffffff',
                    fontWeight: 600,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#e8c4c4',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(212, 165, 165, 0.4)',
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
