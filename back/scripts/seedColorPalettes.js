import { sequelize } from '../src/config/database.js';
import { ColorPalette } from '../src/models/ColorPalette.js';

const predefinedPalettes = [
    {
        name: 'Elegante Rosa',
        primary_color: '#d4a5a5',
        secondary_color: '#c9a9a9',
        accent_color: '#e8c4c4',
        text_color: '#5d4e4e',
        is_active: true // Esta será la paleta por defecto
    },
    {
        name: 'Azul Corporativo',
        primary_color: '#4a90e2',
        secondary_color: '#7bb3f0',
        accent_color: '#a8d0f7',
        text_color: '#2c3e50',
        is_active: false
    },
    {
        name: 'Verde Natura',
        primary_color: '#27ae60',
        secondary_color: '#58d68d',
        accent_color: '#85e6a3',
        text_color: '#1e8449',
        is_active: false
    },
    {
        name: 'Púrpura Moderno',
        primary_color: '#8e44ad',
        secondary_color: '#bb8fce',
        accent_color: '#d7bde2',
        text_color: '#6c3483',
        is_active: false
    },
    {
        name: 'Naranja Vibrante',
        primary_color: '#e67e22',
        secondary_color: '#f39c12',
        accent_color: '#f8c471',
        text_color: '#d35400',
        is_active: false
    },
    {
        name: 'Gris Profesional',
        primary_color: '#34495e',
        secondary_color: '#5d6d7e',
        accent_color: '#85929e',
        text_color: '#2c3e50',
        is_active: false
    },
    {
        name: 'Rojo Pasión',
        primary_color: '#e74c3c',
        secondary_color: '#ec7063',
        accent_color: '#f1948a',
        text_color: '#c0392b',
        is_active: false
    },
    {
        name: 'Turquesa Fresco',
        primary_color: '#1abc9c',
        secondary_color: '#48c9b0',
        accent_color: '#76d7c4',
        text_color: '#17a085',
        is_active: false
    }
];

async function seedColorPalettes() {
    try {
        console.log('🎨 Iniciando seeding de paletas de colores...');
        
        // Verificar si ya existen paletas
        const existingPalettes = await ColorPalette.count();
        if (existingPalettes > 0) {
            console.log('⚠️  Las paletas de colores ya existen. Saltando seeding.');
            return;
        }

        // Crear las paletas predefinidas
        await ColorPalette.bulkCreate(predefinedPalettes);
        
        console.log('✅ Paletas de colores creadas exitosamente:');
        predefinedPalettes.forEach((palette, index) => {
            console.log(`   ${index + 1}. ${palette.name} ${palette.is_active ? '(Activa)' : ''}`);
        });
        
    } catch (error) {
        console.error('❌ Error al crear paletas de colores:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    seedColorPalettes()
        .then(() => {
            console.log('🎨 Seeding de paletas completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en seeding:', error);
            process.exit(1);
        });
}

export { seedColorPalettes };