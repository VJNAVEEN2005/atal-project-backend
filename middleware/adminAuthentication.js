// Admin Authentication Middleware
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const adminAuthentication = (req, res, next) => {
    const token = req.headers['token'];
    console.log('Token received:', token);
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'No token provided' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'Failed to authenticate token' 
            });
        }

        // Check if the user is an admin
        if (decoded.role < 1) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admins only.' 
            });
        }

        req.user = decoded; // Attach user info to request
        next();
    });
}

module.exports = adminAuthentication;