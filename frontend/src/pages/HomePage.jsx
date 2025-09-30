// src/pages/HomePage.jsx
import React from 'react';
import { Typography, Box, Paper, Container } from '@mui/material';
import CategoryCardList from '../components/CategoryCardList.jsx';
import HeroSection from '../components/HeroSection.jsx';
import ImageCarousel from '../components/ImageCarousel.jsx';

function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
       <Typography variant="h1" component="h1" gutterBottom sx={{ color: 'secondary.main', textAlign: 'center', mb: 4 }}>
        ¡Bienvenido a Infinity Store!
      </Typography>
       <ImageCarousel />

    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ mt: 2 }}>
        <CategoryCardList /> 
      </Box>

    </Box>
         <HeroSection /> 
    </Container>
  );
}

export default HomePage;