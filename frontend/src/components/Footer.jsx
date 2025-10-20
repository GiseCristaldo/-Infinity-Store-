import React, { useState } from 'react';
import { Box, Container, Typography, Button, TextField, Grid, Link as MuiLink, Snackbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);

  const handleSubscribe = () => {
    if (email.trim()) {
      setSnackOpen(true);
      setEmail('');
    }
  };

  return (
    <Box component="footer" sx={{ background: theme.palette.background.default }}>
      <Container sx={{ px: 3, py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography component="pre" sx={{ color: 'primary.main', fontSize: { xs: '1.2rem', sm: '1.6rem' }, display: 'inline-block', mb: 1 }}>
{`    ∧＿∧
    (｡･ω･｡)
    /　 づ💕`}
          </Typography>
          <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>Gracias por visitarnos~</Typography>
        </Box>

        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Box sx={{
            backgroundColor: 'background.paper',
            borderRadius: 4,
            border: `2px solid ${theme.palette.primary.light}`,
            p: 3,
            mb: 3,
            boxShadow: '0 6px 20px rgba(212, 165, 165, 0.25)',
          }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
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
                    '& fieldset': { borderColor: theme.palette.primary.light },
                    '&:hover fieldset': { borderColor: theme.palette.primary.main },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: theme.palette.text.secondary,
                    opacity: 1,
                  },
                  borderRadius: 999,
                }}
              />
              <Button variant="contained" color="primary" onClick={handleSubscribe} sx={{ borderRadius: 999, px: 4 }}>
                →
              </Button>
            </Box>
          </Box>

          <Box sx={{
            backgroundColor: 'background.paper',
            borderRadius: 4,
            border: `2px solid ${theme.palette.primary.light}`,
            p: 3,
            mb: 3,
            boxShadow: '0 6px 20px rgba(212, 165, 165, 0.25)',
          }}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md="auto">
                <Box sx={{ textAlign: 'center' }}>
                  
                </Box>
              </Grid>
              <Grid item xs={12} md="auto">
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>Ayuda</Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    {['FAQ', 'Envíos', 'Contacto'].map((help) => (
                      <MuiLink
                        key={help}
                        component={RouterLink}
                        to={help === 'FAQ' ? '/faq' : help === 'Envíos' ? '/envios' : '/contacto'}
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

          <Box sx={{
            backgroundColor: 'background.paper',
            borderRadius: 4,
            border: `2px solid ${theme.palette.primary.light}`,
            p: 3,
            boxShadow: '0 6px 20px rgba(212, 165, 165, 0.25)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
              {[
                { emoji: '♡', name: 'Discord' },
                { emoji: '★', name: 'Twitch' },
                { emoji: '◆', name: 'Instagram' },
                { emoji: '♪', name: 'TikTok' },
              ].map((social) => (
                <Box key={social.name} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    color: theme.palette.primary.contrastText,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.08)' },
                  }}>
                    {social.emoji}
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                    {social.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: `2px solid ${theme.palette.primary.light}` }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <span>© {new Date().getFullYear()}</span>
            <span>•</span>
            <span>Hecho con amor geek</span>
            <span style={{ color: theme.palette.primary.main }}>💜</span>
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        message="Gracias por suscribirte ✨"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}