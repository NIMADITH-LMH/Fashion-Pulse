const jwt = require('jsonwebtoken')

async function authToken(req, res, next) {
    try {
        // Check for token in both cookie and Authorization header
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: "Please log in to your account",
                error: true,
                success: false
            });
        }

        jwt.verify(token, process.env.TOKEN_SECRET_KEY, function(err, decoded) {
            if (err) {
                console.error("Auth error:", err);
                return res.status(401).json({
                    message: "Invalid or expired token. Please log in again.",
                    error: true,
                    success: false
                });
            }
            
            if (!decoded?._id) {
                return res.status(401).json({
                    message: "Invalid token payload",
                    error: true,
                    success: false
                });
            }

            // Fix: Change userID to userId to match what the controller expects
            req.userId = decoded._id;
            next();
        });
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(500).json({
            message: "Authentication error",
            error: true,
            success: false
        });
    }
}

module.exports = authToken;