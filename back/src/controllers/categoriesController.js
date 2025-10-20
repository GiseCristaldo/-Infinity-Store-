import { Category } from '../models/index.js';

//Obtener todas las categorias activas

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({where: {active: true}});
        res.json(categories);
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        res.status(500).json({nessage: 'Error al obtener las categorias'});
    }
};

//Obtener categorias por ID

export const getCategoriesById = async (req, res) => {
    try {
        const {id} = req.params;
        const category = await Category.findByPk(id);
        if(!category) {
            return res.status(404).json({message: 'Categoria no encontrada'});
        }
        res.json(category);
    } catch (error) {
    console.error('Error al obtener la categoría:', error);
    res.status(500).json({ message: 'Error al obtener la categoría' });
  }
};

//Crear una categoria

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'El nombre es obligatorio.' });
        }

        // Si se sube un archivo, usar su path; si no, usar placeholder
        const imagePath = req.file ? req.file.path : null;
        const imagenURL = imagePath 
            ? `http://localhost:3001/${imagePath}`
            : 'https://via.placeholder.com/200x200?text=Categoria';

        const newCategory = await Category.create({ 
            name, 
            imagenURL
        });

        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error al crear la categoría:', error);
        res.status(500).json({ message: 'Error al crear la categoría' });
    }
};

  //Actualizar una categoria
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, active } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Si se sube un archivo, usar su path como nueva imagen
        const imagePath = req.file ? req.file.path : null;
        const newImagenURL = imagePath ? `http://localhost:3001/${imagePath}` : undefined;

        category.name = name || category.name;
        if (newImagenURL) category.imagenURL = newImagenURL;
        category.active = active !== undefined ? active : category.active;

        await category.save();
        res.json(category);
    } catch (error) {
        console.error('Error al actualizar la categoría:', error);
        res.status(500).json({ message: 'Error al actualizar la categoría' });
    }
};

//Eliminar logico una categoria
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        category.active = false;
        await category.save();
        res.json({ message: 'Categoría eliminada lógicamente' });
    } catch (error) {
        console.error('Error al eliminar la categoría:', error);
        res.status(500).json({ message: 'Error al eliminar la categoría' });
    }
};
