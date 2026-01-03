const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

// Middleware to check if user is Admin or HR
const isAdminOrHR = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'HR') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin or HR privileges required.'
        });
    }
    next();
};

// Middleware to check if user is Admin only
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    isAdminOrHR,
    isAdmin
};
