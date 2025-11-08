import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const SiteSettings = sequelize.define('SiteSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    site_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Infinity Store',
        validate: {
            len: [1, 50] // Nombre del sitio debe tener entre 1 y 50 caracteres
        }
    },
    hero_image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isUrl: true // Validación de URL válida
        }
    },
    carousel_images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [], // Array de objetos con {image: string, title: string, subtitle: string}
        comment: 'Array de objetos con estructura: [{image: "url", title: "título", subtitle: "subtítulo"}]'
    },
    // hero_enabled: {
    //     type: DataTypes.BOOLEAN,
    //     allowNull: false,
    //     defaultValue: true,
    //     comment: 'Controla si el hero section es visible en el frontend'
    // }, // TODO: Para uso futuro
    footer_content: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: [0, 1000] // Máximo 1000 caracteres para el footer
        }
    },
    active_palette_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'color_palettes',
            key: 'id'
        }
    },
    primary_font: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Inter',
        validate: {
            isIn: [['Inter', 'Roboto', 'Open Sans', 'Lato', 'Dancing Script', 'Caveat']]
        }
    },
    heading_font: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Orbitron',
        validate: {
            isIn: [['Orbitron', 'Playfair Display', 'Montserrat', 'Poppins', 'Great Vibes', 'Pacifico', 'Shrikhand']]
        }
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    tableName: 'site_settings',
    timestamps: false // Manejamos updated_at manualmente
});

// Método estático para obtener o crear configuración por defecto
SiteSettings.getOrCreateDefault = async function() {
    try {
        let settings = await this.findOne();
        
        if (!settings) {
            // Crear configuración por defecto
            settings = await this.create({
                site_name: 'Infinity Store',
                hero_image_url: null,
                carousel_images: [],
                // hero_enabled: true, // TODO: Para uso futuro
                footer_content: '© 2024 Infinity Store. Todos los derechos reservados.',
                active_palette_id: 1, // Asumiendo que la primera paleta será la activa
                primary_font: 'Inter',
                heading_font: 'Orbitron',
                updated_by: null
            });
        }
        
        return settings;
    } catch (error) {
        console.error('Error al obtener o crear configuración por defecto:', error);
        throw error;
    }
};