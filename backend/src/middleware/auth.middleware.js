// Auth middleware using JWT
import { jwt } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Restaurant } from "../models/restaurant.model.js";

// Middleware to protect routes
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return new ApiError(401, 'Not authorized, token missing');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const restaurant = await Restaurant.findById(decoded.id);
        if (!restaurant) {
            return new ApiError(401, 'Not authorized, restaurant not found');
        }
        req.restaurant = restaurant;
        next();
    } catch (error) {
        return new ApiError(401, 'Not authorized, token failed');
    }
});

export {
    protect
};