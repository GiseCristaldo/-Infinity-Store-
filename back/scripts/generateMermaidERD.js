import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../src/config/database.js';
// Importa asociaciones para que Sequelize conozca relaciones
import '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getModels() {
  // Asegura que los modelos estén cargados
  const models = sequelize.models || {};
  return models;
}

function typeToString(attr) {
  try {
    const t = attr.type;
    if (!t) return 'UNKNOWN';
    // Sequelize v6 tiene .key, .toSql(), .toString()
    if (t.key) return t.key.toUpperCase();
    if (typeof t.toSql === 'function') return String(t.toSql()).toUpperCase();
    return String(t).toUpperCase();
  } catch {
    return 'UNKNOWN';
  }
}

function buildMermaid(models) {
  const lines = ['erDiagram'];

  // Entidades con atributos
  for (const [name, model] of Object.entries(models)) {
    const attrs = model.rawAttributes || model.getAttributes?.() || {};
    const attrLines = [];
    for (const [attrName, attr] of Object.entries(attrs)) {
      const t = typeToString(attr);
      // Mermaid ER no requiere tipos estrictos, pero ayuda en lectura
      attrLines.push(`  ${name} {\n    ${t} ${attrName}\n  }`);
      break; // Evita duplicar entidad por cada atributo; declararemos entidad una vez
    }
    // Si no hay atributos, declara entidad vacía
    if (attrLines.length === 0) {
      lines.push(`  ${name} {\n    string id\n  }`);
    } else {
      lines.push(...attrLines);
    }
  }

  // Relaciones (evitar duplicados)
  const seen = new Set();
  for (const [sourceName, model] of Object.entries(models)) {
    const associations = model.associations || {};
    for (const [assocKey, assoc] of Object.entries(associations)) {
      const targetName = assoc.target?.name || assoc.target?.options?.name?.singular || 'Unknown';
      const type = assoc.associationType || assoc.constructor?.name || 'Association';

      let edge = null;
      if (type === 'HasMany') {
        edge = `${sourceName} ||--o{ ${targetName} : hasMany`;
      } else if (type === 'HasOne') {
        edge = `${sourceName} ||--|| ${targetName} : hasOne`;
      } else if (type === 'BelongsTo') {
        // belongsTo implica FK en el source hacia target (uno target -> muchos source)
        edge = `${targetName} ||--o{ ${sourceName} : hasMany`;
      } else if (type === 'BelongsToMany') {
        edge = `${sourceName} }|..|{ ${targetName} : belongsToMany`;
      }
      if (edge) {
        const key = [sourceName, targetName].sort().join('::');
        if (!seen.has(key)) {
          lines.push('  ' + edge);
          seen.add(key);
        }
      }
    }
  }

  return lines.join('\n');
}

async function generate() {
  try {
    // Garantiza conexión para que modelos y asociaciones estén disponibles
    await sequelize.authenticate();

    const models = getModels();
    const mermaid = buildMermaid(models);

    const outDir = path.resolve(__dirname, '../../docs/db');
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, 'erd.mmd');
    fs.writeFileSync(outFile, mermaid, 'utf8');

    console.log(`✅ ERD Mermaid generado en: ${outFile}`);
    console.log('📖 Ábrelo con un visor Mermaid (VSCode extension) o incrústalo en Markdown.');
  } catch (err) {
    console.error('❌ Error generando ERD:', err);
    process.exit(1);
  } finally {
    try { await sequelize.close(); } catch {}
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generate();
}

export { generate };