import { Product, Category, File } from '../models/index.js';
import { Op } from 'sequelize';

// --- Obtener todos los productos ---
export const getProducts = async (req, res) => {
    try {
        const { name, category, page = 1, limit = 10, sort } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = { active: true };

        if (name) {
            whereClause.name = { [Op.like]: `%${name}%` };
        }
        if (category) {
            whereClause.categoryId = category;
        }

        // Determinar criterio de orden
        let orderField = 'name';
        let orderDirection = 'ASC';
        if (typeof sort === 'string') {
            const s = String(sort).toLowerCase();
            if (s === 'price_asc') {
                orderField = 'price';
                orderDirection = 'ASC';
            } else if (s === 'price_desc') {
                orderField = 'price';
                orderDirection = 'DESC';
            } else if (s === 'name_desc') {
                orderField = 'name';
                orderDirection = 'DESC';
            } else if (s === 'name_asc') {
                orderField = 'name';
                orderDirection = 'ASC';
            }
        }

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[orderField, orderDirection]],
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                },
                {
                    model: File,
                    as: 'files',
                    where: { active: true },
                    required: false,
                    attributes: ['id', 'path', 'isPrimary', 'order'],
                    order: [['order', 'ASC']]
                }
            ]
        });

        // Formatear las rutas de imagen para la respuesta paginada
        const productsWithFormattedImages = rows.map(product => {
            const productJson = product.toJSON();
            
            // Procesar archivos múltiples
            if (productJson.files && productJson.files.length > 0) {
                productJson.images = productJson.files.map(file => ({
                    id: file.id,
                    url: `http://localhost:3001/${file.path}`,
                    isPrimary: file.isPrimary,
                    order: file.order
                }));
                
                // Encontrar imagen principal o usar la primera
                const primaryImage = productJson.files.find(file => file.isPrimary) || productJson.files[0];
                productJson.imagenPath = `http://localhost:3001/${primaryImage.path}`;
            } else {
                // Fallback a imagen placeholder si no hay archivos
                productJson.imagenPath = productJson.imagenPath 
                    ? `http://localhost:3001/${productJson.imagenPath}`
                    : 'https://placehold.co/400x200/4a4a4a/f0f0f0?text=No+Image';
                productJson.images = [];
            }
            
            // Limpiar el campo files del JSON de respuesta
            delete productJson.files;
            
            return productJson;
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            products: productsWithFormattedImages,
            totalItems: count,
            totalPages: totalPages,
            currentPage: parseInt(page),
        });

    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener los productos.' });
    }
};

// --- Obtener Detalle de un Producto por ID ---
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                },
                {
                    model: File,
                    as: 'files',
                    where: { active: true },
                    required: false,
                    attributes: ['id', 'path', 'isPrimary', 'order', 'originalName'],
                    order: [['order', 'ASC']]
                }
            ]
        });

        if (!product || !product.active) {
            return res.status(404).json({ message: 'Producto no encontrado o no disponible.' });
        }

        const productResponse = product.toJSON();

        // Procesar archivos múltiples
        if (productResponse.files && productResponse.files.length > 0) {
            productResponse.images = productResponse.files.map(file => ({
                id: file.id,
                url: `http://localhost:3001/${file.path}`,
                isPrimary: file.isPrimary,
                order: file.order,
                originalName: file.originalName
            }));
            
            // Encontrar imagen principal o usar la primera
            const primaryImage = productResponse.files.find(file => file.isPrimary) || productResponse.files[0];
            productResponse.imagenPath = `http://localhost:3001/${primaryImage.path}`;
        } else {
            // Fallback a imagen placeholder o imagen legacy
            productResponse.imagenPath = product.imagenPath
                ? `http://localhost:3001/${product.imagenPath}`
                : 'https://placehold.co/400x400/4a4a4a/f0f0f0?text=No+Image';
            productResponse.images = [];
        }
        
        // Limpiar el campo files del JSON de respuesta
        delete productResponse.files;
        
        // Formatear el precio
        productResponse.price = parseFloat(product.price).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        });

        // Eliminar el campo 'imagenURL' si aún existe para evitar confusiones
        delete productResponse.imagenURL;

        res.json(productResponse);

    } catch (error) {
        console.error('Error al obtener el producto por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el producto.' });
    }
};

// --- Crear un nuevo producto ---
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, offer, discount } = req.body;
        const imagenPath = req.file ? req.file.path : null;

        if (!name || !description || !price || stock === undefined || !categoryId) {
            return res.status(400).json({ message: 'Todos los campos (nombre, descripción, precio, stock, categoryId) son obligatorios.' });
        }
        if (price <= 0 || stock < 0) {
            return res.status(400).json({ message: 'Precio debe ser mayor a 0 y stock no puede ser negativo.' });
        }
        if (discount !== undefined && (discount < 0 || discount > 100)) {
            return res.status(400).json({ message: 'El descuento debe ser un valor entre 0 y 100.' });
        }

        const categoryExists = await Category.findByPk(categoryId);
        if (!categoryExists) {
            return res.status(400).json({ message: 'La categoría especificada no existe.' });
        }

        const newProduct = await Product.create({
            name,
            description,
            price,
            stock,
            imagenPath, // Ahora se usa el path de la imagen
            categoryId,
            active: true,
            offer: offer || false,
            discount: discount || 0
        });

        res.status(201).json({ message: 'Producto creado exitosamente.', product: newProduct });

    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear el producto.' });
    }
};

// --- Actualizar un producto existente ---
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, categoryId, active, offer, discount } = req.body;
        
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        // Si se subió un nuevo archivo, usar su path; si no, mantener el path existente.
        const imagenPath = req.file ? req.file.path : product.imagenPath;

        const updateData = {
            name,
            description,
            price,
            stock,
            categoryId,
            active,
            offer,
            discount,
            imagenPath,
        };

        await product.update(updateData);

        res.json({ message: 'Producto actualizado exitosamente.', product });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el producto.' });
    }
};

// --- Crear un nuevo producto con múltiples archivos ---
export const createProductWithFiles = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, offer, discount, primaryImageIndex } = req.body;
        const files = req.files;

        if (!name || !description || !price || stock === undefined || !categoryId) {
            return res.status(400).json({ message: 'Todos los campos (nombre, descripción, precio, stock, categoryId) son obligatorios.' });
        }
        if (price <= 0 || stock < 0) {
            return res.status(400).json({ message: 'Precio debe ser mayor a 0 y stock no puede ser negativo.' });
        }
        if (discount !== undefined && (discount < 0 || discount > 100)) {
            return res.status(400).json({ message: 'El descuento debe ser un valor entre 0 y 100.' });
        }

        const categoryExists = await Category.findByPk(categoryId);
        if (!categoryExists) {
            return res.status(400).json({ message: 'La categoría especificada no existe.' });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'Se requiere al menos una imagen para el producto.' });
        }

        // Crear el producto
        const newProduct = await Product.create({
            name,
            description,
            price,
            stock,
            categoryId,
            active: true,
            offer: offer || false,
            discount: discount || 0
        });

        // Crear registros de archivos
        const fileRecords = [];
        const primaryIndex = parseInt(primaryImageIndex) || 0;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileRecord = await File.create({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                mimeType: file.mimetype,
                size: file.size,
                productId: newProduct.id,
                isPrimary: i === primaryIndex,
                order: i + 1,
                active: true
            });
            fileRecords.push(fileRecord);
        }

        // Establecer imagenPath del producto con la imagen principal
        const primaryFile = fileRecords[primaryIndex] || fileRecords[0];
        await newProduct.update({ imagenPath: primaryFile.path });

        res.status(201).json({ 
            message: 'Producto creado exitosamente con múltiples imágenes.', 
            product: newProduct,
            files: fileRecords
        });
    } catch (error) {
        console.error('Error creating product with files:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

// Actualizar un producto existente con múltiples archivos
export const updateProductWithFiles = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, categoryId, active, offer, discount, existingImages, primaryImageIndex } = req.body;
        const files = req.files;
        
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        // Actualizar datos básicos del producto
        const updateData = {
            name,
            description,
            price,
            stock,
            categoryId,
            active,
            offer,
            discount,
        };

        await product.update(updateData);

        // Manejar imágenes existentes
        let existingImagesArray = [];
        if (existingImages) {
            try {
                existingImagesArray = JSON.parse(existingImages);
            } catch (e) {
                console.error('Error parsing existingImages:', e);
            }
        }

        // Desactivar todas las imágenes actuales del producto
        await File.update(
            { active: false },
            { where: { productId: id } }
        );

        // Reactivar imágenes existentes que se mantienen
        const keptImageIds = existingImagesArray.map(img => img.id).filter(Boolean);
        if (keptImageIds.length > 0) {
            await File.update(
                { active: true },
                { where: { id: keptImageIds, productId: id } }
            );
        }

        // Agregar nuevas imágenes si las hay
        const newFileRecords = [];
        if (files && files.length > 0) {
            // Obtener el orden máximo actual
            const maxOrder = await File.max('order', { where: { productId: id, active: true } }) || 0;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileRecord = await File.create({
                    filename: file.filename,
                    originalName: file.originalname,
                    path: file.path,
                    mimeType: file.mimetype,
                    size: file.size,
                    productId: parseInt(id),
                    isPrimary: false, // Se establecerá después
                    order: maxOrder + i + 1,
                    active: true
                });
                newFileRecords.push(fileRecord);
            }
        }

        // Establecer imagen principal
        const allActiveFiles = await File.findAll({
            where: { productId: id, active: true },
            order: [['order', 'ASC']]
        });

        if (allActiveFiles.length > 0) {
            // Quitar marca de primaria de todas las imágenes
            await File.update(
                { isPrimary: false },
                { where: { productId: id } }
            );

            // Establecer nueva imagen principal
            const primaryIndex = parseInt(primaryImageIndex) || 0;
            const primaryFile = allActiveFiles[primaryIndex] || allActiveFiles[0];
            await primaryFile.update({ isPrimary: true });
            
            // Actualizar imagenPath del producto
            await product.update({ imagenPath: primaryFile.path });
        }

        res.json({ 
            message: 'Producto actualizado exitosamente.', 
            product,
            newFiles: newFileRecords
        });
    } catch (error) {
        console.error('Error al actualizar el producto con archivos:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el producto.' });
    }
};

// --- Eliminar lógicamente un producto ---
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        await product.update({ active: false });

        res.status(200).json({ message: 'Producto eliminado lógicamente (desactivado) exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar el producto.' });
    }
};