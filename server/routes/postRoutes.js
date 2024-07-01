const { Router } = require('express');
const { 
    createPost, 
    getPosts, 
    getPost, 
    getCatPosts, 
    getUserPosts, 
    editPost, 
    removePost, 
    getPostsByCategory 
} = require('../controllers/postControllers');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

// Routes
router.post('/', authMiddleware, createPost);
router.get('/', getPosts);
router.get('/categories/:category', getPostsByCategory); // Ensure this is before the dynamic ID route
router.get('/users/:id', getUserPosts);
router.get('/:id', getPost);
router.patch('/:id', authMiddleware, editPost);
router.delete('/:id', authMiddleware, removePost);

module.exports = router;
