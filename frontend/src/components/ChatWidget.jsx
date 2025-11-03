import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Drawer,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Tooltip
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog.jsx';

function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1.5
      }}
    >
      <Box
        sx={{
          maxWidth: '80%',
          p: 1.2,
          borderRadius: 2,
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          boxShadow: 1,
          border: (theme) => isUser ? `1px solid ${theme.palette.primary.dark}` : `1px solid ${theme.palette.secondary.main}`,
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: isUser ? 'primary.contrastText' : 'text.primary' }}>
          {text}
        </Typography>
      </Box>
    </Box>
  );
}

function ProductsPreview({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ mt: 1.5 }}>
      <Chip label={`Productos encontrados: ${items.length}`} size="small" sx={{ mb: 1 }} />
      <List dense>
        {items.slice(0, 6).map((p) => (
          <ListItem key={p.id} sx={{
            bgcolor: 'grey.100',
            borderRadius: 1,
            mb: 0.5,
            px: 1
          }}>
            <Avatar
              src={p.imagenPath ? `http://localhost:3001/${p.imagenPath}` : undefined}
              alt={p.name}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Link to={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                      {p.name}
                    </Typography>
                  </Link>
                  {p.category?.name && (
                    <Chip label={p.category.name} size="small" />
                  )}
                </Box>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {Number.isFinite(p.price) ? `$${Number(p.price).toFixed(2)}` : ''}
                  {p.discount && p.discount > 0 ? ` • ${p.discount}% off` : ''}
                  {p.ofert ? ' • Oferta' : ''}
                  {p.stock > 0 ? ' • En stock' : ' • Sin stock'}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
      {items.length > 6 && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Más resultados disponibles, visita la página del producto para ver todo.
        </Typography>
      )}
    </Box>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '¡Hola! ✨ Soy Lumos, tu asistente geek. ¡Estoy aquí para iluminar tus dudas! Pregúntame por productos disponibles, precios o medios de pago. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [lastData, setLastData] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const scrollRef = useRef(null);

  // Extraer sugerencias simples desde el último mensaje del usuario
  const normalize = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Ampliamos stopwords para no sugerir saludos/verbos genéricos
  const stopwords = new Set([
    'de','la','el','los','las','y','o','para','en','con','sin','un','una','unos','unas','que','del','por','al',
    'hola','tienen','tiene','hay','buenas','buenos','dias','días','tardes','noches'
  ]);
  const extractSuggestions = (msg) => {
    const m = normalize(msg);
    const tokens = m.replace(/[^a-z0-9áéíóúñ\s]/g, ' ').split(/\s+/).filter(Boolean);
    const terms = tokens.filter(t => t.length >= 3 && !stopwords.has(t));
    const uniq = [];
    for (const t of terms) { if (!uniq.includes(t)) uniq.push(t); }
    return uniq.slice(0, 2);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, lastData, open]);

  const toggle = () => setOpen((o) => !o);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    // Push user message
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setSending(true);
    setLastData(null);

    try {
      const resp = await axios.post('/api/chat', { message: trimmed }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const { reply, data } = resp.data || {};
      setMessages((prev) => [...prev, { role: 'bot', text: reply || '...' }]);
      setLastData(data || null);
    } catch (err) {
      console.error('Error al enviar mensaje al chatbot:', err);
      const msg = err.response?.data?.message || 'Error al procesar tu mensaje. Inténtalo nuevamente.';
      setMessages((prev) => [...prev, { role: 'bot', text: msg }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Tooltip title="Chatear con el asistente" placement="left">
        <Fab
          color="primary"
          aria-label="chat"
          onClick={toggle}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>

      <Drawer anchor="right" open={open} onClose={toggle} sx={{ zIndex: 1300, '& .MuiDrawer-paper': { width: { xs: '100vw', sm: 380 }, maxWidth: '100vw' } }}>
        <Box sx={{ width: { xs: '100%', sm: 380 }, display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}> ✨ ᒐᥙຕo⳽ ✨ </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Limpiar chat">
                <IconButton onClick={() => setConfirmClearOpen(true)} aria-label="limpiar">
                  <ClearAllIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={toggle} aria-label="cerrar">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider />

          <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {messages.map((m, idx) => (
              <MessageBubble key={idx} role={m.role} text={m.text} />
            ))}
            {lastData?.items && lastData.items.length > 0 && (
              <ProductsPreview items={lastData.items} />
            )}
            {lastData && Array.isArray(lastData.items) && lastData.items.length === 0 && (() => {
              const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.text || '';
              // Evitar sugerencias si el bot ya dijo “No encontré productos…”
              const lastBotMsg = [...messages].reverse().find(m => m.role === 'bot')?.text?.toLowerCase() || '';
              const suppressSuggestions = lastBotMsg.includes('no encontré productos');
              if (!lastUserMsg || suppressSuggestions) return null;
              const suggestions = extractSuggestions(lastUserMsg);
              if (suggestions.length === 0) return null;
              return (
                <Box sx={{ mt: 1.5, bgcolor: 'warning.light', p: 1.5, borderRadius: 1, color: 'text.primary', border: (theme) => `1px solid ${theme.palette.warning.main}` }}>
                  <Typography variant="body2">
                    Prueba con {suggestions.length === 2 ? `‘${suggestions[0]}’ o ‘${suggestions[1]}’` : `‘${suggestions[0]}’`}.
                  </Typography>
                </Box>
              );
            })()}
          </Box>

          <Divider />
          <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <Button
              variant="contained"
              endIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              onClick={sendMessage}
              disabled={sending}
            >
              Enviar
            </Button>
          </Box>
        </Box>
      </Drawer>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Limpiar chat"
        onConfirm={() => {
          setMessages([{ role: 'bot', text: '¡Hola! ✨ Soy Lumos, tu asistente geek. ¡Estoy aquí para iluminar tus dudas! Pregúntame por productos disponibles, precios o medios de pago. ¿En qué puedo ayudarte hoy?' }]);
          setLastData(null);
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      >
        Esta acción borrará la conversación actual.
      </ConfirmDialog>
    </>
  );
}