import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ColorPalette = sequelize.define('ColorPalette', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            len: [1, 50] // Nombre debe tener entre 1 y 50 caracteres
        }
    },
    primary_color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        validate: {
            is: /^#[0-9A-Fa-f]{6}$/ // Validación de código hexadecimal
        }
    },
    secondary_color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        validate: {
            is: /^#[0-9A-Fa-f]{6}$/ // Validación de código hexadecimal
        }
    },
    accent_color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        validate: {
            is: /^#[0-9A-Fa-f]{6}$/ // Validación de código hexadecimal
        }
    },
    text_color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        validate: {
            is: /^#[0-9A-Fa-f]{6}$/ // Validación de código hexadecimal
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    tableName: 'color_palettes',
    timestamps: false // Manejamos created_at manualmente
});