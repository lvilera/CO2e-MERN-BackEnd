const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'this_is_a_secure_jwt_secret_123456';
const ACCESS_TOKEN_EXPIRY_TIME = process.env.ACCESS_TOKEN_EXPIRY_TIME || "2d";

const hashPassword = async (password) => {
    let hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return hashedPassword;
};

const comparePassword = async (storedPassword, password) => {
    let passwordMatch = await bcrypt.compare(password, storedPassword);

    return passwordMatch;
};

const createAccessToken = (payload) => {
    let token = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY_TIME,
    });
    return token;
};

const verifyAccessToken = (token) => {
    try {
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        return payload;
    } catch (err) {
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    createAccessToken,
    verifyAccessToken,
}