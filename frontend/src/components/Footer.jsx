import React, { useState } from 'react';
import { Box, Container, Typography, Button, TextField, Grid, Link as MuiLink, Snackbar } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { Alert } from '@mui/material';
import { API_ENDPOINTS } from '../config/api.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Footer() {
  const muiTheme = useMuiTheme();
  const { currentSettings } = useTheme();
  const [email, setEmail] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('Gracias por suscribirte ✨');

  // Get dynamic footer content or fallback to default
  const footerContent = currentSettings?.footer_content || `© ${new Date().getFullYear()} ${currentSettings?.site_name || 'Infinity Store'}. Todos los derechos reservados.`;
  const siteName = currentSettings?.site_name || 'Infinity Store';

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    try {
      await axios.post(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, { email });
      setSnackMsg('Gracias por suscribirte ✨');
      setSnackOpen(true);
      setEmail('');
    } catch (err) {
      setSnackMsg(err.response?.data?.message || 'No pudimos registrar tu suscripción.');
      setSnackOpen(true);
    }
  };

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box component="footer" sx={{ background: muiTheme.palette.background.default }}>
      <Container sx={{ px: 3, py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography component="pre" sx={{ color: 'primary.main', fontSize: { xs: '1.2rem', sm: '1.6rem' }, display: 'inline-block', mb: 1 }}>
{`    ∧＿∧
    (｡･ω･｡)
    /　 づ💕`}
          </Typography>
          <Typography sx={{ color: 'text.primary', fontWeight: 600, fontFamily: 'var(--font-primary)' }}>Gracias por visitarnos~</Typography>
        </Box>

        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Box sx={{
            backgroundColor: 'background.paper',
            borderRadius: 4,
            border: `2px solid ${muiTheme.palette.primary.light}`,
            p: 3,
            mb: 3,
            boxShadow: '0 6px 20px rgba(212, 165, 165, 0.25)',
          }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 700, color: 'text.primary', fontFamily: 'var(--font-primary)' }}>
                ✨ Suscríbete y recibe un 10% OFF ✨
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, maxWidth: 420, mx: 'auto', justifyContent: 'center', alignItems: 'center' }}>
              <TextField
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f4f4',
                    '& fieldset': { borderColor: muiTheme.palette.primary.light },
                    '&:hover fieldset': { borderColor: muiTheme.palette.primary.main },
                    '&.Mui-focused fieldset': { borderColor: muiTheme.palette.primary.main },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: muiTheme.palette.text.secondary,
                    opacity: 1,
                  },
                  borderRadius: 999,
                }}
              />
              <Button variant="contained" color="primary" onClick={handleSubscribe}>Suscribirme</Button>
            </Box>
          </Box>

          <Box sx={{
            backgroundColor: 'background.paper',
            borderRadius: 4,
            border: `2px solid ${muiTheme.palette.primary.light}`,
            p: 3,
            mb: 3,
            boxShadow: '0 6px 20px rgba(212, 165, 165, 0.25)',
          }}>
            <Grid container spacing={3} justifyContent="center">
              {/* Antes: <Grid item xs={12} md="auto"> */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ textAlign: 'center' }}>
                  
                </Box>
              </Grid>
              {/* Antes: <Grid item xs={12} md="auto"> */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 1, fontFamily: 'var(--font-primary)' }}>Ayuda</Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    {['FAQ', 'Envíos', 'Contacto'].map((help) => (
                      <MuiLink
                        key={help}
                        component={RouterLink}
                        to={help === 'FAQ' ? '/faq' : help === 'Envíos' ? '/envios' : '/contacto'}
                        onClick={handleLinkClick}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, fontSize: '0.9rem' }}
                      >
                        {help}
                      </MuiLink>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

        </Box>

        <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: `2px solid ${muiTheme.palette.primary.light}` }}>
          <Typography 
            sx={{ 
              color: 'text.secondary', 
              fontSize: '0.9rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1,
              flexWrap: 'wrap'
            }}
          >
            {/* Render dynamic footer content with HTML support */}
            <Box 
              component="span" 
              dangerouslySetInnerHTML={{ __html: footerContent }}
              sx={{ 
                '& a': { 
                  color: muiTheme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }
              }}
            />
            <span>•</span>
            <span>Hecho con amor geek</span>
            <span style={{ color: muiTheme.palette.primary.main }}>💜</span>
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackMsg.startsWith('Gracias') ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}