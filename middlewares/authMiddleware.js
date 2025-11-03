const User = require('../models/User');
const authUtils = require("../utils/authUtils");

const authenticateRequest = (req, res, next) => {
    try {
        let token = req.cookies.token;


        if (!token && req.headers.authorization) {
            token = req.headers.authorization.replace('Bearer ', '');
        }

        if (!token) {
            return res.status(401).json({ error: "Invalid or missing token!" });
        }

        const payload = authUtils.verifyAccessToken(token);
        if (!payload) {
            return res.status(401).json({ error: "Invalid or missing token!" });
        }

        req.user = payload;
        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({ error: "Token verification failed!" });
    }
};

const verifyRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!requiredRoles.includes(user.role)) {
                return res.status(403).json({ error: 'Insufficient role' });
            }

            next();
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};

module.exports = {
    authenticateRequest,
    verifyRole
};
