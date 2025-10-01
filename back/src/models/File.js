import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const File = sequelize.define('File', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del archivo generado por el sistema'
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre original del archivo subido por el usuario'
    },
    path: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Ruta relativa del archivo en el servidor'
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Tipo MIME del archivo (image/jpeg, image/png, etc.)'
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Tamaño del archivo en bytes'
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'ID del producto al que pertenece este archivo'
    },
    isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Indica si esta es la imagen principal del producto'
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Orden de visualización de la imagen'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Estado activo/inactivo del archivo'
    }
}, {
    tableName: 'files',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
        {
            fields: ['productId']
        },
        {
            fields: ['productId', 'isPrimary']
        },
        {
            fields: ['productId', 'order']
        }
    ]
});