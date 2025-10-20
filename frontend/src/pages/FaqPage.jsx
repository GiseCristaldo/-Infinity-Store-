import React from 'react';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FaqPage() {
  const faqs = [
    { q: '¿Cómo puedo realizar un pedido?', a: 'Elige tus productos, añádelos al carrito y finaliza el checkout.' },
    { q: '¿Qué métodos de pago aceptan?', a: 'Actualmente el pago es simulado para UX. Pronto integraremos pasarelas reales.' },
    { q: '¿Cómo puedo seguir mi orden?', a: 'Ve a Mis Órdenes para ver el estado y detalles.' },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, mb: 2 }}>
          Preguntas Frecuentes
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
          Resolvemos tus dudas más comunes
        </Typography>
      </Box>
      {faqs.map((item, idx) => (
        <Accordion key={idx} sx={{ mb: 2, border: '1px solid', borderColor: 'primary.light', borderRadius: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>{item.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ color: 'text.secondary' }}>{item.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
}