const Category = require('../models/categoryModel');
const HttpError = require('../models/errorModel');

const createCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        console.log("Creating category with data:", { name });
        const newCategory = await Category.create({ name });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error("Error creating category:", error.message);
        console.error("Stack Trace:", error.stack);
        return next(new HttpError("Internal Server Error", 500));
    }
};

const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error.message);
        console.error("Stack Trace:", error.stack);
        return next(new HttpError("Internal Server Error", 500));
    }
};




const getCategory = async (req, res, next) => {
    const categoryId = req.params.id;

    try {
        const category = await Category.findById(categoryId);

        if (!category) {
            return next(new HttpError("Category not found.", 404));
        }

        res.status(200).json(category);
    } catch (error) {
        console.error("Error fetching category:", error.message);
        return next(new HttpError("Internal Server Error", 500));
    }
};

const updateCategory = async (req, res, next) => {
    const categoryId = req.params.id;
    const { name, description } = req.body;

    try {
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, { name, description }, { new: true, runValidators: true });

        if (!updatedCategory) {
            return next(new HttpError("Category not found.", 404));
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error("Error updating category:", error.message);
        return next(new HttpError("Internal Server Error", 500));
    }
};

const deleteCategory = async (req, res, next) => {
    const categoryId = req.params.id;

    try {
        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return next(new HttpError("Category not found.", 404));
        }

        res.status(200).json({ message: "Category deleted successfully." });
    } catch (error) {
        console.error("Error deleting category:", error.message);
        return next(new HttpError("Internal Server Error", 500));
    }
};

module.exports = { createCategory, getCategories , deleteCategory, updateCategory, getCategory};
