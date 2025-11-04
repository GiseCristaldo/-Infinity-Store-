import { sequelize } from '../src/config/database.js';

async function updateCustomizationHistoryEnum() {
    try {
        console.log('🔄 Actualizando ENUM de customization_history...');
        
        // Actualizar el ENUM para incluir los nuevos valores
        await sequelize.query(`
            ALTER TABLE customization_history 
            MODIFY COLUMN change_type ENUM(
                'color_palette', 
                'typography', 
                'hero_image', 
                'carousel', 
                'branding',
                'carousel_image_added',
                'carousel_text_updated',
                'carousel_image_deleted',
                'hero_visibility_changed'
            ) NOT NULL
        `);
        
        console.log('✅ ENUM actualizado exitosamente');
        
    } catch (error) {
        console.error('❌ Error actualizando ENUM:', error);
    } finally {
        await sequelize.close();
    }
}

updateCustomizationHistoryEnum();