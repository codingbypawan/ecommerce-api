const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = 'my_secret_key';

const authMiddleWare = (req, res, next) => {
  const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'Unauthorized', message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const isVerified = jwt.verify(token, JWT_SECRET_KEY);
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ status: 'Unauthorized', message: 'Invalid token' });
    }
};

module.exports = authMiddleWare;