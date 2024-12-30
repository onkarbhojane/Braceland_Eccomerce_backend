import jwt from 'jsonwebtoken';

const jwtAuthMiddleware = (req, res, next) => {
    try {
        console.log("JWT Auth Middleware Triggered");

        const authHeader = req.headers.authorization;
        console.log(authHeader)
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header is missing' });
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token is missing in Authorization header' });
        }

        const decoded = jwt.verify(token, "1234");
        req.userPayload = decoded;

        next();
    } catch (error) {
        console.error("JWT Verification Failed:", error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const generateToken = (userData) => {
    try {
        return jwt.sign(userData, "1234");
    } catch (error) {
        console.error('Error generating token:', error.message);
        throw error;
    }
};

export { jwtAuthMiddleware, generateToken };
