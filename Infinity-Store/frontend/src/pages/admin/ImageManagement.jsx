function ImageManagement() {
  // ... existing code ...

  // Comentario: componente memoizado, edición inline estable y sin autoFocus para evitar saltos del cursor.
  const ImageCard = React.memo(({ src, alt, onDelete, onPreview, index, showReorder = false, imageText }) => {
    return (
      <Card sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            cursor: 'pointer'
          }}
          onClick={() => onPreview(src)}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
          }}
        >
          {showReorder && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  minWidth: 28,
                  height: 28,
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
                  '&:disabled': { backgroundColor: 'rgba(0,0,0,0.3)' }
                }}
                onClick={() => reorderCarouselImages(index, index - 1)}
                disabled={index === 0}
                title="Mover hacia arriba"
              >
                ↑
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  minWidth: 28,
                  height: 28,
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
                  '&:disabled': { backgroundColor: 'rgba(0,0,0,0.3)' }
                }}
                onClick={() => reorderCarouselImages(index, index + 1)}
                disabled={index === currentImages.carousel_images.length - 1}
                title="Mover hacia abajo"
              >
                ↓
              </IconButton>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                minWidth: 28,
                height: 28,
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
              }}
              onClick={() => onPreview(src)}
              title="Vista previa"
            >
              <PreviewIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'rgba(220,53,69,0.8)',
                color: 'white',
                minWidth: 28,
                height: 28,
                '&:hover': { backgroundColor: 'rgba(220,53,69,0.9)' }
              }}
              onClick={() => onDelete(index)}
              title="Eliminar imagen"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {showReorder && (
          <Box sx={{ p: 1, textAlign: 'center', backgroundColor: 'grey.100' }}>
            <Typography variant="caption">Posición {index + 1}</Typography>
          </Box>
        )}

        <CardContent sx={{ pt: 1 }}>
          {/* Comentario: edición en línea con textarea nativo controlado para evitar saltos del cursor */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
            <Box sx={{ flex: 1 }}>
              {/* Comentario: textarea controlado con onChange; actualiza slideTexts sin remounts */}
              <textarea
                value={slideTexts[index] ?? ''}
                onChange={(e) => handleTextChange(index, e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                  resize: 'vertical'
                }}
                maxLength={200}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                {(slideTexts[index] ?? '').length}/200
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
              {/* Comentario: guardado explícito para evitar persistencia en cada tecla */}
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleSaveText(index)}
                disabled={(slideTexts[index] ?? '').trim() === ''}
                sx={{
                  minWidth: 32,
                  height: 32,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' },
                  '&:disabled': { backgroundColor: 'grey.300' }
                }}
              >
                ✓
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  });

  // Comentario: cancelEditing ya no es necesario; lo dejamos como no-op para evitar errores.
  const cancelEditing = () => {};

  // ... existing code ...
}