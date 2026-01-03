const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    signUp,
    signIn,
    changePassword,
    getCurrentUser
} = require('../controllers/authController');

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);

// Protected routes
router.post('/change-password', authenticateToken, changePassword);
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;
