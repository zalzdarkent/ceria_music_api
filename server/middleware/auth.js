const jwt = require('jsonwebtoken');
const ResponseAPI = require('../utils/response');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return ResponseAPI.unauthorized(res, 'Token tidak ditemukan');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        return ResponseAPI.unauthorized(res, 'Token tidak valid');
    }
};

module.exports = authMiddleware;
