const express = require('express');
const { createCategory, getCategories, getCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const router = express.Router();

// Category routes
router.post('/', createCategory);
router.get('/', getCategories);
router.get('/:id', getCategory); // Route for fetching a single category
router.patch('/:id', updateCategory); // Route for updating a category
router.delete('/:id', deleteCategory); // Route for deleting a category

module.exports = router;