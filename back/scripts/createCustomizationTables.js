import { sequelize } from '../src/config/database.js';
import { ColorPalette } from '../src/models/ColorPalette.js';
import { SiteSettings } from '../src/models/SiteSettings.js';
import { CustomizationHistory } from '../src/models/CustomizationHistory.js';
import { seedColorPalettes } from './seedColorPalettes.js';

async function createCustomizationTables() {
    try {
        console.log('🔧 Iniciando creación de tablas de personalización...');
        
        // Crear las tablas en el orden correcto (respetando dependencias)
        console.log('📋 Creando tabla color_palettes...');
        await ColorPalette.sync({ force: false });
        
        console.log('⚙️  Creando tabla site_settings...');
        await SiteSettings.sync({ force: false });
        
        console.log('📝 Creando tabla customization_history...');
        await CustomizationHistory.sync({ force: false });
        
        console.log('✅ Tablas de personalización creadas exitosamente');
        
        // Seed de paletas de colores
        console.log('🎨 Ejecutando seeding de paletas de colores...');
        await seedColorPalettes();
        
        // Crear configuración por defecto
        console.log('⚙️  Creando configuración por defecto...');
        await SiteSettings.getOrCreateDefault();
        
        console.log('🎉 Sistema de personalización configurado exitosamente');
        
    } catch (error) {
        console.error('❌ Error al crear tablas de personalización:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    createCustomizationTables()
        .then(() => {
            console.log('✅ Migración completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en migración:', error);
            process.exit(1);
        });
}

export { createCustomizationTables };