import { ColorPalette, SiteSettings, CustomizationHistory, sequelize } from '../models/index.js';

/**
 * Get all available color palettes
 * GET /api/super-admin/customization/palettes
 */
export const getColorPalettes = async (req, res) => {
  try {
    // Get all color palettes ordered by name
    const palettes = await ColorPalette.findAll({
      order: [['name', 'ASC']]
    });

    // Get current active palette from site settings
    const siteSettings = await SiteSettings.getOrCreateDefault();
    const activePaletteId = siteSettings.active_palette_id;

    // Mark the active palette
    const palettesWithActiveStatus = palettes.map(palette => ({
      ...palette.toJSON(),
      is_currently_active: palette.id === activePaletteId
    }));

    res.status(200).json({
      success: true,
      message: 'Paletas de colores obtenidas exitosamente',
      data: {
        palettes: palettesWithActiveStatus,
        active_palette_id: activePaletteId,
        total_count: palettes.length
      }
    });

  } catch (error) {
    console.error('Error al obtener paletas de colores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener paletas de colores',
      code: 'GET_PALETTES_ERROR'
    });
  }
};

/**
 * Change the active color palette
 * PUT /api/super-admin/customization/palette
 */
export const changeActivePalette = async (req, res) => {
  try {
    const { palette_id } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!palette_id) {
      return res.status(400).json({
        success: false,
        message: 'ID de paleta es requerido',
        code: 'PALETTE_ID_REQUIRED'
      });
    }

    // Validate palette_id is a number
    const paletteId = parseInt(palette_id);
    if (isNaN(paletteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paleta debe ser un número válido',
        code: 'INVALID_PALETTE_ID'
      });
    }

    // Check if the palette exists
    const palette = await ColorPalette.findByPk(paletteId);
    if (!palette) {
      return res.status(404).json({
        success: false,
        message: 'Paleta de colores no encontrada',
        code: 'PALETTE_NOT_FOUND'
      });
    }

    // Get current site settings
    const siteSettings = await SiteSettings.getOrCreateDefault();
    const oldPaletteId = siteSettings.active_palette_id;

    // Check if it's the same palette (no change needed)
    if (oldPaletteId === paletteId) {
      return res.status(200).json({
        success: true,
        message: 'La paleta seleccionada ya está activa',
        data: {
          palette: palette.toJSON(),
          no_change: true
        }
      });
    }

    // Update the active palette
    await siteSettings.update({
      active_palette_id: paletteId,
      updated_by: userId,
      updated_at: new Date()
    });

    // Clear settings cache after update
    clearSettingsCache();

    // Create history record
    await CustomizationHistory.create({
      change_type: 'color_palette',
      old_value: {
        palette_id: oldPaletteId,
        palette_name: oldPaletteId ? (await ColorPalette.findByPk(oldPaletteId))?.name : null
      },
      new_value: {
        palette_id: paletteId,
        palette_name: palette.name,
        colors: {
          primary_color: palette.primary_color,
          secondary_color: palette.secondary_color,
          accent_color: palette.accent_color,
          text_color: palette.text_color
        }
      },
      changed_by: userId,
      changed_at: new Date()
    });

    // Get the updated palette with full details
    const updatedPalette = await ColorPalette.findByPk(paletteId);

    res.status(200).json({
      success: true,
      message: `Paleta de colores cambiada exitosamente a "${palette.name}"`,
      data: {
        palette: updatedPalette.toJSON(),
        previous_palette_id: oldPaletteId,
        changed_at: new Date().toISOString(),
        changed_by: userId
      }
    });

  } catch (error) {
    console.error('Error al cambiar paleta de colores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al cambiar paleta de colores',
      code: 'CHANGE_PALETTE_ERROR'
    });
  }
};

/**
 * Get available font options with predefined combinations
 * GET /api/customization/fonts
 */
export const getFontOptions = async (req, res) => {
  try {
    // Define predefined font options as per design document
    const fontOptions = {
      primary_fonts: [
        { name: 'Inter', category: 'sans-serif', description: 'Sans-serif moderna y legible' },
        { name: 'Roboto', category: 'sans-serif', description: 'Sans-serif clásica de Google' },
        { name: 'Open Sans', category: 'sans-serif', description: 'Sans-serif amigable y versátil' },
        { name: 'Lato', category: 'sans-serif', description: 'Sans-serif humanista' },
        { name: 'Dancing Script', category: 'cursive', description: 'Cursiva elegante y fluida ✨' },
        { name: 'Caveat', category: 'cursive', description: 'Cursiva casual y manuscrita ✨' }
      ],
      heading_fonts: [
        { name: 'Orbitron', category: 'sans-serif', description: 'Futurista y tecnológica' },
        { name: 'Playfair Display', category: 'serif', description: 'Serif elegante y sofisticada' },
        { name: 'Montserrat', category: 'sans-serif', description: 'Sans-serif geométrica y moderna' },
        { name: 'Poppins', category: 'sans-serif', description: 'Sans-serif redondeada y amigable' },
        { name: 'Great Vibes', category: 'cursive', description: 'Cursiva script muy elegante ✨' },
        { name: 'Pacifico', category: 'cursive', description: 'Cursiva surf y relajada ✨' }
      ],
      font_combinations: [
        { 
          name: 'Moderno Profesional', 
          primary_font: 'Inter', 
          heading_font: 'Orbitron',
          description: 'Combinación moderna y profesional'
        },
        { 
          name: 'Elegante Clásico', 
          primary_font: 'Open Sans', 
          heading_font: 'Playfair Display',
          description: 'Elegancia clásica con serif'
        },
        { 
          name: 'Casual Amigable', 
          primary_font: 'Lato', 
          heading_font: 'Poppins',
          description: 'Estilo casual y amigable'
        },
        { 
          name: 'Artístico Cursivo', 
          primary_font: 'Roboto', 
          heading_font: 'Great Vibes',
          description: 'Combinación artística con cursiva elegante ✨'
        },
        { 
          name: 'Creativo Manuscrito', 
          primary_font: 'Inter', 
          heading_font: 'Dancing Script',
          description: 'Estilo creativo con toque manuscrito ✨'
        },
        { 
          name: 'Relajado Surf', 
          primary_font: 'Open Sans', 
          heading_font: 'Pacifico',
          description: 'Estilo relajado y surf ✨'
        }
      ]
    };

    // Get current font settings
    const siteSettings = await SiteSettings.getOrCreateDefault();
    const currentFonts = {
      primary_font: siteSettings.primary_font,
      heading_font: siteSettings.heading_font
    };

    res.status(200).json({
      success: true,
      message: 'Opciones de tipografía obtenidas exitosamente',
      data: {
        ...fontOptions,
        current_fonts: currentFonts,
        google_fonts_needed: [
          'Inter', 'Roboto', 'Open Sans', 'Lato', 'Dancing Script', 'Caveat',
          'Orbitron', 'Playfair Display', 'Montserrat', 'Poppins', 'Great Vibes', 'Pacifico'
        ]
      }
    });

  } catch (error) {
    console.error('Error al obtener opciones de tipografía:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener opciones de tipografía',
      code: 'GET_FONTS_ERROR'
    });
  }
};

/**
 * Update site fonts
 * PUT /api/customization/fonts
 */
export const updateSiteFonts = async (req, res) => {
  try {
    const { primary_font, heading_font, combination_preset } = req.body;
    const userId = req.user.id;

    // Define valid font options
    const validPrimaryFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Dancing Script', 'Caveat'];
    const validHeadingFonts = ['Orbitron', 'Playfair Display', 'Montserrat', 'Poppins', 'Great Vibes', 'Pacifico'];

    let newPrimaryFont = primary_font;
    let newHeadingFont = heading_font;

    // If combination preset is provided, use those fonts
    if (combination_preset) {
      const presets = {
        'moderno-profesional': { primary: 'Inter', heading: 'Orbitron' },
        'elegante-clasico': { primary: 'Open Sans', heading: 'Playfair Display' },
        'casual-amigable': { primary: 'Lato', heading: 'Poppins' },
        'artistico-cursivo': { primary: 'Roboto', heading: 'Great Vibes' },
        'creativo-manuscrito': { primary: 'Inter', heading: 'Dancing Script' },
        'relajado-surf': { primary: 'Open Sans', heading: 'Pacifico' }
      };

      const preset = presets[combination_preset];
      if (!preset) {
        return res.status(400).json({
          success: false,
          message: 'Preset de combinación de fuentes no válido',
          code: 'INVALID_FONT_PRESET'
        });
      }

      newPrimaryFont = preset.primary;
      newHeadingFont = preset.heading;
    }

    // Validate individual font selections
    if (newPrimaryFont && !validPrimaryFonts.includes(newPrimaryFont)) {
      return res.status(400).json({
        success: false,
        message: 'Fuente primaria no válida',
        errors: {
          primary_font: `Debe ser una de: ${validPrimaryFonts.join(', ')}`
        },
        code: 'INVALID_PRIMARY_FONT'
      });
    }

    if (newHeadingFont && !validHeadingFonts.includes(newHeadingFont)) {
      return res.status(400).json({
        success: false,
        message: 'Fuente de encabezados no válida',
        errors: {
          heading_font: `Debe ser una de: ${validHeadingFonts.join(', ')}`
        },
        code: 'INVALID_HEADING_FONT'
      });
    }

    // At least one font must be provided
    if (!newPrimaryFont && !newHeadingFont) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos una fuente para actualizar',
        code: 'NO_FONTS_PROVIDED'
      });
    }

    // Get current site settings
    const siteSettings = await SiteSettings.getOrCreateDefault();
    const oldFonts = {
      primary_font: siteSettings.primary_font,
      heading_font: siteSettings.heading_font
    };

    // Prepare update data
    const updateData = {
      updated_by: userId,
      updated_at: new Date()
    };

    if (newPrimaryFont) {
      updateData.primary_font = newPrimaryFont;
    }
    if (newHeadingFont) {
      updateData.heading_font = newHeadingFont;
    }

    // Check if there are actual changes
    const hasChanges = (newPrimaryFont && newPrimaryFont !== oldFonts.primary_font) ||
                      (newHeadingFont && newHeadingFont !== oldFonts.heading_font);

    if (!hasChanges) {
      return res.status(200).json({
        success: true,
        message: 'Las fuentes seleccionadas ya están activas',
        data: {
          fonts: {
            primary_font: siteSettings.primary_font,
            heading_font: siteSettings.heading_font
          },
          no_change: true
        }
      });
    }

    // Update the fonts
    await siteSettings.update(updateData);

    // Clear settings cache after update
    clearSettingsCache();

    // Create history record
    await CustomizationHistory.create({
      change_type: 'typography',
      old_value: oldFonts,
      new_value: {
        primary_font: newPrimaryFont || oldFonts.primary_font,
        heading_font: newHeadingFont || oldFonts.heading_font,
        combination_preset: combination_preset || null
      },
      changed_by: userId,
      changed_at: new Date()
    });

    // Get updated settings
    const updatedSettings = await SiteSettings.findByPk(siteSettings.id);

    res.status(200).json({
      success: true,
      message: 'Tipografía actualizada exitosamente',
      data: {
        fonts: {
          primary_font: updatedSettings.primary_font,
          heading_font: updatedSettings.heading_font
        },
        previous_fonts: oldFonts,
        changed_at: new Date().toISOString(),
        changed_by: userId,
        combination_used: combination_preset || null
      }
    });

  } catch (error) {
    console.error('Error al actualizar tipografía:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar tipografía',
      code: 'UPDATE_FONTS_ERROR'
    });
  }
};

/**
 * Update branding settings (site name and footer content)
 * PUT /api/customization/branding
 */
export const updateBrandingSettings = async (req, res) => {
  try {
    const { site_name, footer_content } = req.body;
    const userId = req.user.id;

    // Validate input - at least one field must be provided
    if (!site_name && !footer_content) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar (site_name o footer_content)',
        code: 'NO_BRANDING_DATA_PROVIDED'
      });
    }

    // Validate site_name if provided
    if (site_name !== undefined) {
      if (typeof site_name !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El nombre del sitio debe ser una cadena de texto',
          errors: {
            site_name: 'Debe ser una cadena de texto válida'
          },
          code: 'INVALID_SITE_NAME_TYPE'
        });
      }

      if (site_name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del sitio no puede estar vacío',
          errors: {
            site_name: 'El nombre del sitio es requerido'
          },
          code: 'SITE_NAME_EMPTY'
        });
      }

      if (site_name.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del sitio no puede exceder 50 caracteres',
          errors: {
            site_name: 'Máximo 50 caracteres permitidos'
          },
          code: 'SITE_NAME_TOO_LONG'
        });
      }
    }

    // Validate footer_content if provided
    if (footer_content !== undefined) {
      if (typeof footer_content !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El contenido del footer debe ser una cadena de texto',
          errors: {
            footer_content: 'Debe ser una cadena de texto válida'
          },
          code: 'INVALID_FOOTER_CONTENT_TYPE'
        });
      }

      if (footer_content.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'El contenido del footer no puede exceder 1000 caracteres',
          errors: {
            footer_content: 'Máximo 1000 caracteres permitidos'
          },
          code: 'FOOTER_CONTENT_TOO_LONG'
        });
      }
    }

    // HTML sanitization for footer content
    let sanitizedFooterContent = footer_content;
    if (footer_content !== undefined) {
      // Basic HTML sanitization - allow only safe tags
      const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'span'];
      const allowedAttributes = {
        'a': ['href', 'target', 'rel'],
        'span': ['class']
      };

      // Simple sanitization - remove script tags and dangerous attributes
      sanitizedFooterContent = footer_content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:/gi, '');

      // Additional validation for potentially dangerous content
      if (sanitizedFooterContent.includes('<script') || 
          sanitizedFooterContent.includes('javascript:') || 
          sanitizedFooterContent.includes('vbscript:')) {
        return res.status(400).json({
          success: false,
          message: 'El contenido del footer contiene elementos no permitidos',
          errors: {
            footer_content: 'No se permiten scripts o contenido ejecutable'
          },
          code: 'FOOTER_CONTENT_UNSAFE'
        });
      }
    }

    // Get current site settings
    const siteSettings = await SiteSettings.getOrCreateDefault();
    const oldBranding = {
      site_name: siteSettings.site_name,
      footer_content: siteSettings.footer_content
    };

    // Prepare update data
    const updateData = {
      updated_by: userId,
      updated_at: new Date()
    };

    if (site_name !== undefined) {
      updateData.site_name = site_name.trim();
    }
    if (footer_content !== undefined) {
      updateData.footer_content = sanitizedFooterContent;
    }

    // Check if there are actual changes
    const hasChanges = (site_name !== undefined && site_name.trim() !== oldBranding.site_name) ||
                      (footer_content !== undefined && sanitizedFooterContent !== oldBranding.footer_content);

    if (!hasChanges) {
      return res.status(200).json({
        success: true,
        message: 'La configuración de branding ya está actualizada',
        data: {
          branding: {
            site_name: siteSettings.site_name,
            footer_content: siteSettings.footer_content
          },
          no_change: true
        }
      });
    }

    // Update the branding settings
    await siteSettings.update(updateData);

    // Clear settings cache after update
    clearSettingsCache();

    // Create history record
    await CustomizationHistory.create({
      change_type: 'branding',
      old_value: oldBranding,
      new_value: {
        site_name: updateData.site_name || oldBranding.site_name,
        footer_content: updateData.footer_content || oldBranding.footer_content
      },
      changed_by: userId,
      changed_at: new Date()
    });

    // Get updated settings
    const updatedSettings = await SiteSettings.findByPk(siteSettings.id);

    res.status(200).json({
      success: true,
      message: 'Configuración de branding actualizada exitosamente',
      data: {
        branding: {
          site_name: updatedSettings.site_name,
          footer_content: updatedSettings.footer_content
        },
        previous_branding: oldBranding,
        changed_at: new Date().toISOString(),
        changed_by: userId,
        sanitization_applied: footer_content !== undefined && footer_content !== sanitizedFooterContent
      }
    });

  } catch (error) {
    console.error('Error al actualizar configuración de branding:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar configuración de branding',
      code: 'UPDATE_BRANDING_ERROR'
    });
  }
};

/**
 * Get customization history with pagination and filtering
 * GET /api/customization/history
 */
export const getCustomizationHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      change_type,
      user_id,
      start_date,
      end_date
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Número de página debe ser un entero positivo',
        code: 'INVALID_PAGE_NUMBER'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Límite debe ser un entero entre 1 y 100',
        code: 'INVALID_LIMIT'
      });
    }

    // Build where clause for filtering
    const whereClause = {};
    
    // Filter by change type
    if (change_type) {
      const validChangeTypes = ['color_palette', 'typography', 'hero_image', 'carousel', 'branding'];
      if (!validChangeTypes.includes(change_type)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de cambio no válido',
          errors: {
            change_type: `Debe ser uno de: ${validChangeTypes.join(', ')}`
          },
          code: 'INVALID_CHANGE_TYPE'
        });
      }
      whereClause.change_type = change_type;
    }

    // Filter by user ID
    if (user_id) {
      const userId = parseInt(user_id);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario debe ser un número válido',
          code: 'INVALID_USER_ID'
        });
      }
      whereClause.changed_by = userId;
    }

    // Filter by date range
    if (start_date || end_date) {
      whereClause.changed_at = {};
      
      if (start_date) {
        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Fecha de inicio no válida',
            code: 'INVALID_START_DATE'
          });
        }
        whereClause.changed_at.gte = startDate;
      }

      if (end_date) {
        const endDate = new Date(end_date);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Fecha de fin no válida',
            code: 'INVALID_END_DATE'
          });
        }
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
        whereClause.changed_at.lte = endDate;
      }
    }

    // Calculate offset
    const offset = (pageNum - 1) * limitNum;

    // Get history with pagination and filtering
    const historyResult = await CustomizationHistory.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset: offset,
      order: [['changed_at', 'DESC']],
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'nombre', 'email', 'rol']
      }]
    });

    // Calculate pagination info
    const totalPages = Math.ceil(historyResult.count / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Format the response
    const formattedEntries = historyResult.rows.map(entry => ({
      id: entry.id,
      change_type: entry.change_type,
      old_value: entry.old_value,
      new_value: entry.new_value,
      changed_at: entry.changed_at,
      user: {
        id: entry.user.id,
        name: entry.user.nombre,
        email: entry.user.email,
        role: entry.user.rol
      }
    }));

    res.status(200).json({
      success: true,
      message: 'Historial de personalización obtenido exitosamente',
      history: formattedEntries, // Cambiar para que coincida con el frontend
      data: {
        entries: formattedEntries,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_entries: historyResult.count,
          entries_per_page: limitNum,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        filters_applied: {
          change_type: change_type || null,
          user_id: user_id ? parseInt(user_id) : null,
          start_date: start_date || null,
          end_date: end_date || null
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener historial de personalización:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener historial de personalización',
      code: 'GET_HISTORY_ERROR'
    });
  }
};

/**
 * Revert a customization change to its previous state
 * POST /api/customization/revert/:id
 */
export const revertCustomizationChange = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate history entry ID
    const historyId = parseInt(id);
    if (isNaN(historyId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de historial debe ser un número válido',
        code: 'INVALID_HISTORY_ID'
      });
    }

    // Find the history entry
    const historyEntry = await CustomizationHistory.findByPk(historyId, {
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'nombre', 'email']
      }]
    });

    if (!historyEntry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de historial no encontrada',
        code: 'HISTORY_ENTRY_NOT_FOUND'
      });
    }

    // Check if there's an old_value to revert to
    if (!historyEntry.old_value) {
      return res.status(400).json({
        success: false,
        message: 'No hay valor anterior para revertir (cambio inicial)',
        code: 'NO_PREVIOUS_VALUE'
      });
    }

    // Get current site settings
    const siteSettings = await SiteSettings.getOrCreateDefault();
    let currentValue = {};
    let revertSuccess = false;

    // Handle different change types
    switch (historyEntry.change_type) {
      case 'color_palette':
        // Revert color palette
        const oldPaletteId = historyEntry.old_value.palette_id;
        if (!oldPaletteId) {
          return res.status(400).json({
            success: false,
            message: 'ID de paleta anterior no válido',
            code: 'INVALID_OLD_PALETTE_ID'
          });
        }

        // Verify the old palette still exists
        const oldPalette = await ColorPalette.findByPk(oldPaletteId);
        if (!oldPalette) {
          return res.status(400).json({
            success: false,
            message: 'La paleta anterior ya no existe en el sistema',
            code: 'OLD_PALETTE_NOT_FOUND'
          });
        }

        currentValue = {
          palette_id: siteSettings.active_palette_id,
          palette_name: siteSettings.activePalette?.name
        };

        await siteSettings.update({
          active_palette_id: oldPaletteId,
          updated_by: userId,
          updated_at: new Date()
        });

        revertSuccess = true;
        break;

      case 'typography':
        // Revert typography settings
        currentValue = {
          primary_font: siteSettings.primary_font,
          heading_font: siteSettings.heading_font
        };

        const updateData = {
          updated_by: userId,
          updated_at: new Date()
        };

        if (historyEntry.old_value.primary_font) {
          updateData.primary_font = historyEntry.old_value.primary_font;
        }
        if (historyEntry.old_value.heading_font) {
          updateData.heading_font = historyEntry.old_value.heading_font;
        }

        await siteSettings.update(updateData);
        revertSuccess = true;
        break;

      case 'hero_image':
        // Revert hero image
        currentValue = {
          hero_image_url: siteSettings.hero_image_url
        };

        await siteSettings.update({
          hero_image_url: historyEntry.old_value.hero_image_url,
          updated_by: userId,
          updated_at: new Date()
        });

        revertSuccess = true;
        break;

      case 'carousel':
        // Revert carousel images
        currentValue = {
          carousel_images: siteSettings.carousel_images
        };

        await siteSettings.update({
          carousel_images: historyEntry.old_value.carousel_images,
          updated_by: userId,
          updated_at: new Date()
        });

        revertSuccess = true;
        break;

      case 'branding':
        // Revert branding settings
        currentValue = {
          site_name: siteSettings.site_name,
          footer_content: siteSettings.footer_content
        };

        const brandingUpdateData = {
          updated_by: userId,
          updated_at: new Date()
        };

        if (historyEntry.old_value.site_name !== undefined) {
          brandingUpdateData.site_name = historyEntry.old_value.site_name;
        }
        if (historyEntry.old_value.footer_content !== undefined) {
          brandingUpdateData.footer_content = historyEntry.old_value.footer_content;
        }

        await siteSettings.update(brandingUpdateData);
        revertSuccess = true;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de cambio no soportado para reversión',
          code: 'UNSUPPORTED_CHANGE_TYPE'
        });
    }

    if (!revertSuccess) {
      return res.status(500).json({
        success: false,
        message: 'Error al revertir el cambio',
        code: 'REVERT_FAILED'
      });
    }

    // Clear settings cache after revert
    clearSettingsCache();

    // Create a new history entry for the revert action
    await CustomizationHistory.create({
      change_type: historyEntry.change_type,
      old_value: currentValue,
      new_value: historyEntry.old_value,
      changed_by: userId,
      changed_at: new Date()
    });

    // Get updated settings for response
    const updatedSettings = await SiteSettings.findByPk(siteSettings.id, {
      include: [{
        model: ColorPalette,
        as: 'activePalette'
      }]
    });

    res.status(200).json({
      success: true,
      message: `Cambio de ${historyEntry.change_type} revertido exitosamente`,
      data: {
        reverted_change: {
          id: historyEntry.id,
          change_type: historyEntry.change_type,
          original_change_date: historyEntry.changed_at,
          original_user: historyEntry.user.nombre
        },
        current_settings: {
          site_name: updatedSettings.site_name,
          hero_image_url: updatedSettings.hero_image_url,
          carousel_images: updatedSettings.carousel_images,
          footer_content: updatedSettings.footer_content,
          primary_font: updatedSettings.primary_font,
          heading_font: updatedSettings.heading_font,
          active_palette: updatedSettings.activePalette
        },
        reverted_at: new Date().toISOString(),
        reverted_by: userId
      }
    });

  } catch (error) {
    console.error('Error al revertir cambio de personalización:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al revertir cambio de personalización',
      code: 'REVERT_CHANGE_ERROR'
    });
  }
};

// Simple in-memory cache for settings
let settingsCache = {
  data: null,
  lastUpdated: null,
  ttl: 5 * 60 * 1000 // 5 minutes TTL
};

/**
 * Clear the settings cache (called when settings are updated)
 */
export const clearSettingsCache = () => {
  settingsCache.data = null;
  settingsCache.lastUpdated = null;
};

/**
 * Get current active palette and site theme settings with caching
 * GET /api/settings/current (public endpoint)
 */
export const getCurrentThemeSettings = async (req, res) => {
  try {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (settingsCache.data && 
        settingsCache.lastUpdated && 
        (now - settingsCache.lastUpdated) < settingsCache.ttl) {
      
      // Add cache headers for client-side caching
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'ETag': `"settings-${settingsCache.lastUpdated}"`,
        'Last-Modified': new Date(settingsCache.lastUpdated).toUTCString()
      });

      return res.status(200).json({
        success: true,
        message: 'Configuración de tema actual obtenida exitosamente',
        data: settingsCache.data,
        cached: true,
        cache_timestamp: settingsCache.lastUpdated
      });
    }

    // Get current site settings with active palette from database
    let siteSettings = await SiteSettings.findOne({
      include: [{
        model: ColorPalette,
        as: 'activePalette'
      }]
    });

    if (!siteSettings) {
      // Create default settings if none exist
      const defaultSettings = await SiteSettings.getOrCreateDefault();
      siteSettings = await SiteSettings.findOne({
        where: { id: defaultSettings.id },
        include: [{
          model: ColorPalette,
          as: 'activePalette'
        }]
      });
    }

    // Imágenes por defecto del carousel
    const defaultCarouselImages = [
      {
        image: 'https://i.pinimg.com/736x/70/f3/6a/70f36a427e02f26b3333cefdbefaf16c.jpg',
        text: '¡Nuevas Figuras de Colección!'
      },
      {
        image: 'https://i.pinimg.com/736x/09/5f/44/095f449c0269708344e9cd77c3fd36af.jpg',
        text: 'Cómics y Mangas con 20% OFF'
      },
      {
        image: 'https://i.pinimg.com/736x/56/3c/68/563c68a024301caeac320d8843d3777c.jpg',
        text: 'Ediciones Limitadas de cartas'
      }
    ];

    // Usar imágenes personalizadas si existen, sino usar las por defecto
    const carouselImages = (siteSettings.carousel_images && siteSettings.carousel_images.length > 0) 
      ? siteSettings.carousel_images 
      : defaultCarouselImages;

    // Prepare the response data
    const responseData = {
      site_name: siteSettings.site_name,
      hero_image_url: siteSettings.hero_image_url,
      carousel_images: carouselImages,
      footer_content: siteSettings.footer_content,
      primary_font: siteSettings.primary_font,
      heading_font: siteSettings.heading_font,
      color_palette: siteSettings.activePalette ? {
        id: siteSettings.activePalette.id,
        name: siteSettings.activePalette.name,
        primary_color: siteSettings.activePalette.primary_color,
        secondary_color: siteSettings.activePalette.secondary_color,
        accent_color: siteSettings.activePalette.accent_color,
        text_color: siteSettings.activePalette.text_color
      } : null,
      // Add Google Fonts information for frontend
      google_fonts_needed: [
        siteSettings.primary_font,
        siteSettings.heading_font
      ].filter((font, index, arr) => arr.indexOf(font) === index), // Remove duplicates
      // Add CSS custom properties for easy theme application
      css_variables: siteSettings.activePalette ? {
        '--primary-color': siteSettings.activePalette.primary_color,
        '--secondary-color': siteSettings.activePalette.secondary_color,
        '--accent-color': siteSettings.activePalette.accent_color,
        '--text-color': siteSettings.activePalette.text_color,
        '--primary-font': siteSettings.primary_font,
        '--heading-font': siteSettings.heading_font
      } : {
        '--primary-font': siteSettings.primary_font,
        '--heading-font': siteSettings.heading_font
      }
    };

    // Update cache
    settingsCache.data = responseData;
    settingsCache.lastUpdated = now;

    // Add cache headers
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'ETag': `"settings-${now}"`,
      'Last-Modified': new Date(now).toUTCString()
    });

    res.status(200).json({
      success: true,
      message: siteSettings.id ? 'Configuración de tema actual obtenida exitosamente' : 'Configuración de tema por defecto obtenida',
      data: responseData,
      cached: false,
      cache_timestamp: now
    });

  } catch (error) {
    console.error('Error al obtener configuración de tema:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener configuración de tema',
      code: 'GET_THEME_SETTINGS_ERROR'
    });
  }
};// --- Controlar visibilidad del hero section ---
export const updateHeroVisibility = async (req, res) => {
    try {
        const { enabled } = req.body;

        // Obtener configuración actual
        let siteSettings = await SiteSettings.findOne();
        if (!siteSettings) {
            siteSettings = await SiteSettings.create({
                site_name: 'Infinity Store',
                updated_by: req.user.id
            });
        }

        // Guardar valor anterior para el historial
        const oldValue = siteSettings.hero_enabled;

        // Actualizar visibilidad
        await siteSettings.update({
            hero_enabled: enabled,
            updated_by: req.user.id
        });

        // Registrar en historial
        await CustomizationHistory.create({
            change_type: 'hero_visibility_changed',
            old_value: String(oldValue),
            new_value: String(enabled),
            changed_by: req.user.id
        });

        // Limpiar caché
        clearSettingsCache();

        res.json({
            success: true,
            message: `Hero section ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente`,
            data: {
                hero_enabled: enabled
            }
        });

    } catch (error) {
        console.error('Error updating hero visibility:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
/**

 * Create a new color palette
 * POST /api/super-admin/customization/palettes
 */
export const createColorPalette = async (req, res) => {
  try {
    const { name, primary_color, secondary_color, accent_color, text_color } = req.body;

    // Validate required fields
    if (!name || !primary_color || !secondary_color || !accent_color || !text_color) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos: name, primary_color, secondary_color, accent_color, text_color'
      });
    }

    // Validate color format (hex colors)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const colors = [primary_color, secondary_color, accent_color, text_color];
    
    for (const color of colors) {
      if (!hexColorRegex.test(color)) {
        return res.status(400).json({
          success: false,
          message: `Color inválido: ${color}. Use formato hexadecimal (#RRGGBB)`
        });
      }
    }

    // Check if palette name already exists
    const existingPalette = await ColorPalette.findOne({
      where: { name }
    });

    if (existingPalette) {
      return res.status(409).json({
        success: false,
        message: `Ya existe una paleta con el nombre "${name}"`
      });
    }

    // Create new palette
    const newPalette = await ColorPalette.create({
      name,
      primary_color,
      secondary_color,
      accent_color,
      text_color,
      is_active: false // New palettes are not active by default
    });

    // Log the creation in customization history
    await CustomizationHistory.create({
      user_id: req.user?.id || null,
      change_type: 'palette_created',
      change_description: `Nueva paleta de colores creada: ${name}`,
      old_value: null,
      new_value: JSON.stringify({
        name,
        primary_color,
        secondary_color,
        accent_color,
        text_color
      })
    });

    res.status(201).json({
      success: true,
      message: 'Paleta de colores creada exitosamente',
      data: {
        palette: newPalette
      }
    });

  } catch (error) {
    console.error('Error al crear paleta de colores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear paleta de colores',
      code: 'CREATE_PALETTE_ERROR'
    });
  }
};

/**
 * Bulk create multiple color palettes
 * POST /api/super-admin/customization/palettes/bulk
 */
export const createMultipleColorPalettes = async (req, res) => {
  try {
    const { palettes } = req.body;

    if (!Array.isArray(palettes) || palettes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de paletas no vacío'
      });
    }

    const results = {
      created: [],
      skipped: [],
      errors: []
    };

    // Validate and create each palette
    for (const paletteData of palettes) {
      try {
        const { name, primary_color, secondary_color, accent_color, text_color } = paletteData;

        // Validate required fields
        if (!name || !primary_color || !secondary_color || !accent_color || !text_color) {
          results.errors.push({
            name: name || 'Sin nombre',
            error: 'Campos requeridos faltantes'
          });
          continue;
        }

        // Check if palette already exists
        const existingPalette = await ColorPalette.findOne({
          where: { name }
        });

        if (existingPalette) {
          results.skipped.push({
            name,
            reason: 'Ya existe'
          });
          continue;
        }

        // Create palette
        const newPalette = await ColorPalette.create({
          name,
          primary_color,
          secondary_color,
          accent_color,
          text_color,
          is_active: false
        });

        results.created.push({
          id: newPalette.id,
          name: newPalette.name
        });

        // Log creation
        await CustomizationHistory.create({
          user_id: req.user?.id || null,
          change_type: 'palette_created',
          change_description: `Nueva paleta de colores creada: ${name}`,
          old_value: null,
          new_value: JSON.stringify(paletteData)
        });

      } catch (error) {
        results.errors.push({
          name: paletteData.name || 'Sin nombre',
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Proceso completado. Creadas: ${results.created.length}, Omitidas: ${results.skipped.length}, Errores: ${results.errors.length}`,
      data: results
    });

  } catch (error) {
    console.error('Error al crear paletas múltiples:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear paletas múltiples',
      code: 'CREATE_MULTIPLE_PALETTES_ERROR'
    });
  }
};