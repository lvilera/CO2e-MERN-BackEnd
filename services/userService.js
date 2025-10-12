const User = require("../models/User");
const authUtils = require('../utils/authUtils');

const fetchUser = async (userId) => {
    const userProjection = {
        password: 0
    };
    const user = await User.findById(userId, userProjection);
    if (!user) {
        const error = new Error('User not found!');
        error.code = 404;
        throw error;
    }
    return user;
};

const updateUser = async (userId, updatedData) => {
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
        const error = new Error('User not found!');
        error.code = 404;
        throw error;
    }

    if (updatedData.password) {
        updatedData.password = await authUtils.hashPassword(updatedData.password);
    }

    let existingUser;
    if (updatedData.email && updatedData.email !== userToUpdate.email) {
        existingUser = await User.findOne({ email: updatedData.email });
        if (existingUser) {
            const error = new Error('A user with that email has already been registered!');
            error.code = 409;
            throw error;
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updatedData,
        { new: true }
    );

    return updatedUser;
};

const fetchUserStripeCustomerId = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error('User not found!');
        error.code = 404;
        throw error;
    }
    if (user.stripeCustomerId) {
        return user.stripeCustomerId;
    }
    else {
        return null;
    }
};

module.exports = {
    fetchUser,
    updateUser,
    fetchUserStripeCustomerId
};