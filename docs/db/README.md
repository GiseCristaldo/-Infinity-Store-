# Diagrama ER (Mermaid) desde modelos Sequelize

Este proyecto incluye un script que genera un diagrama ER (Entidad–Relación) en formato **Mermaid** a partir de los modelos y asociaciones definidos en Sequelize.

## Requisitos
- Variables de entorno del backend configuradas (`back/.env`)
- Base de datos accesible (local o Docker)
- Opcional: Extensión de VSCode para ver Mermaid o un visor compatible

## Generar ERD

Comando desde la raíz del repo:

```
node back/scripts/generateMermaidERD.js
```

Salida:
- `docs/db/erd.mmd` — archivo Mermaid con el diagrama

## Visualización
- VSCode: instala la extensión “Markdown Preview Mermaid Support” o “Mermaid Editor” y abre `erd.mmd` o incrusta en Markdown:

```mermaid
erDiagram
  // contenido generado
```

- GitHub: algunos renders permiten Mermaid en Markdown; si no, usa un visor local.

## Notas
- El script inspecciona `sequelize.models` y `model.associations` para construir entidades y relaciones (HasOne, HasMany, BelongsTo, BelongsToMany).
- Las relaciones se dibujan con cardinalidades Mermaid estándar:
  - `||--o{` → uno a muchos
  - `||--||` → uno a uno
  - `}|..|{` → muchos a muchos
- El script no requiere Graphviz ni PlantUML.

## Problemas conocidos
- Si no se cargan asociaciones (por ejemplo, si no se importó `src/models/index.js`), el diagrama puede carecer de relaciones. El script ya importa ese archivo.
- Tipos de atributos se muestran de forma simplificada.

## Mantenimiento
- Si añades nuevos modelos o asociaciones, vuelve a ejecutar el script para actualizar el ERD.
- Puedes versionar `erd.mmd` en el repo para mantener documentación viva del esquema.