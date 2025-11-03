import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Snackbar, Paper } from '@mui/material';
import axios from 'axios';
import { Alert } from '@mui/material';
import { API_ENDPOINTS } from '../config/api.js';

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const endpoint = API_ENDPOINTS.CONTACT.SUBMIT || '/api/contact';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await axios.post(endpoint, form);
      setOpen(true);
      setForm({ nombre: '', email: '', mensaje: '' });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'No pudimos enviar tu mensaje.');
      setOpen(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, mb: 2 }}>
          Contacto
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
          Estamos para ayudarte
        </Typography>
      </Box>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, border: '1px solid', borderColor: 'primary.light', borderRadius: 2 }}>
        <TextField
          name="nombre"
          label="Nombre"
          value={form.nombre}
          onChange={handleChange}
          fullWidth
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f8f4f4',
              '& fieldset': { borderColor: 'primary.light' },
              '&:hover fieldset': { borderColor: 'primary.main' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' },
            },
            '& .MuiInputBase-input': { color: 'text.primary' },
            '& .MuiInputBase-input::placeholder': { color: 'text.secondary', opacity: 1 },
            borderRadius: 2,
          }}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f8f4f4',
              '& fieldset': { borderColor: 'primary.light' },
              '&:hover fieldset': { borderColor: 'primary.main' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' },
            },
            '& .MuiInputBase-input': { color: 'text.primary' },
            '& .MuiInputBase-input::placeholder': { color: 'text.secondary', opacity: 1 },
            borderRadius: 2,
          }}
          InputProps={{ inputProps: { 'aria-label': 'Email' } }}
        />
        <TextField
          name="mensaje"
          label="Mensaje"
          value={form.mensaje}
          onChange={handleChange}
          fullWidth
          multiline
          minRows={4}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f8f4f4',
              '& fieldset': { borderColor: 'primary.light' },
              '&:hover fieldset': { borderColor: 'primary.main' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' },
            },
            '& .MuiInputBase-input': { color: 'text.primary' },
            '& .MuiInputBase-input::placeholder': { color: 'text.secondary', opacity: 1 },
            borderRadius: 2,
          }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>Enviar</Button>
      </Paper>
      <Snackbar open={open} autoHideDuration={2500} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setOpen(false)} severity={errorMsg ? 'error' : 'success'} sx={{ width: '100%' }}>
          {errorMsg || '¡Gracias por contactarnos!'}
        </Alert>
      </Snackbar>
    </Container>
  );
}