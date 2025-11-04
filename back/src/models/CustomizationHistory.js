import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CustomizationHistory = sequelize.define('CustomizationHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    change_type: {
        type: DataTypes.ENUM(
            'color_palette', 
            'typography', 
            'hero_image', 
            'carousel', 
            'branding',
            'carousel_image_added',
            'carousel_text_updated',
            'carousel_image_deleted',
            'hero_visibility_changed'
        ),
        allowNull: false
    },
    old_value: {
        type: DataTypes.JSON,
        allowNull: true // Puede ser null para creaciones iniciales
    },
    new_value: {
        type: DataTypes.JSON,
        allowNull: false
    },
    changed_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    changed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    tableName: 'customization_history',
    timestamps: false // Manejamos changed_at manualmente
});

// Método estático para registrar un cambio automáticamente
CustomizationHistory.logChange = async function(changeType, oldValue, newValue, userId) {
    try {
        const historyEntry = await this.create({
            change_type: changeType,
            old_value: oldValue,
            new_value: newValue,
            changed_by: userId,
            changed_at: new Date()
        });
        
        console.log(`📝 Cambio registrado: ${changeType} por usuario ${userId}`);
        return historyEntry;
    } catch (error) {
        console.error('Error al registrar cambio en historial:', error);
        throw error;
    }
};

// Método estático para obtener historial con paginación
CustomizationHistory.getHistory = async function(options = {}) {
    const {
        limit = 50,
        offset = 0,
        changeType = null,
        userId = null
    } = options;
    
    const whereClause = {};
    if (changeType) whereClause.change_type = changeType;
    if (userId) whereClause.changed_by = userId;
    
    try {
        const history = await this.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['changed_at', 'DESC']],
            include: [{
                model: sequelize.models.User,
                as: 'user',
                attributes: ['id', 'nombre', 'email']
            }]
        });
        
        return {
            entries: history.rows,
            total: history.count,
            hasMore: (offset + limit) < history.count
        };
    } catch (error) {
        console.error('Error al obtener historial:', error);
        throw error;
    }
};