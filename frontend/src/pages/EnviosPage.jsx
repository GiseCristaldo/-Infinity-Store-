import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

function EnviosPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, mb: 2 }}>
          Envíos
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
          Políticas y tiempos de entrega
        </Typography>
      </Box>
      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'primary.light', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>Tiempos estimados</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          - Nacional: 3–7 días hábiles. - Internacional: 7–21 días hábiles.
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>Costos</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          Calculados según peso, destino y promociones vigentes.
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>Seguimiento</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Recibirás un número de seguimiento al despachar tu orden.
        </Typography>
      </Paper>
    </Container>
  );
}

export default EnviosPage;