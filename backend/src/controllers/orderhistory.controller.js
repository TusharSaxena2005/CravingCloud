import mongoose, { isValidObjectId } from 'mongoose';
import OrderHistory from '../models/orderhistory.model.js';
import Kitchen from "../models/kitchen.model.js";
import Restaurant from "../models/restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Create order
const createOrder = asyncHandler(async (req, res) => {
    const { restaurantId, userId, totalAmount, items, tableNo } = req.body;
    if (!isValidObjectId(restaurantId)) {
        return new ApiError("Invalid restaurant ID", 400);
    }
    if (!isValidObjectId(userId)) {
        return new ApiError("Invalid user ID", 400);
    }
    if (!isValidObjectId(tableNo)) {
        return new ApiError("Invalid table ID", 400);
    }
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return new ApiError("Restaurant not found", 404);
    }
    const order = await OrderHistory.create({
        restaurantId,
        userId,
        totalAmount,
        items,
        tableNo
    });

    try {
        await Kitchen.create({
            restaurantId,
            order: order._id
        });
    } catch (error) {
        return new ApiError("Failed to add order to kitchen", 500);
    }
    return res
        .status(201)
        .json(new ApiResponse(201, "Order created successfully", order));
});

// Get all orders with filtering
const getAllOrders = asyncHandler(async (req, res) => {
    const { restaurantId, userId, status } = req.query;
    const filter = {};
    if (restaurantId) {
        if (!isValidObjectId(restaurantId)) {
            return new ApiError("Invalid restaurant ID", 400);
        }
        filter.restaurantId = restaurantId;
    }
    if (userId) {
        if (!isValidObjectId(userId)) {
            return new ApiError("Invalid user ID", 400);
        }
        filter.userId = userId;
    }
    if (status) {
        filter.status = status;
    }
    const orders = await OrderHistory.find(filter);
    return res
        .status(200)
        .json(new ApiResponse(200, "Orders retrieved successfully", orders));
});

// Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return new ApiError("Invalid order ID", 400);
    }
    const order = await OrderHistory.findById(id);
    if (!order) {
        return new ApiError("Order not found", 404);
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Order retrieved successfully", order));
});

// Get order by status
const getOrderByStatus = asyncHandler(async (req, res) => {
    const { status } = req.query;
    if (!status) {
        return new ApiError("Status query parameter is required", 400);
    }
    const validStatuses = ['Pending', 'Baking', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return new ApiError("Invalid status value", 400);
    }
    const orders = await OrderHistory.find({ status });
    return res
        .status(200)
        .json(new ApiResponse(200, "Orders retrieved successfully", orders));
});

// Update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!isValidObjectId(id)) {
        return new ApiError("Invalid order ID", 400);
    }
    const validStatuses = ['Pending', 'Baking', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return new ApiError("Invalid status value", 400);
    }
    const order = await OrderHistory.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
        return new ApiError("Order not found", 404);
    }

    // If order is completed or cancelled, remove it from kitchen
    if (status === 'Completed' || status === 'Cancelled') {
        await Kitchen.findOneAndDelete({ order: order._id });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Order status updated successfully", order));
});

// Clear order history by restaurant ID
const clearOrderHistory = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    if (!isValidObjectId(restaurantId)) {
        return new ApiError("Invalid restaurant ID", 400);
    }
    await OrderHistory.deleteMany({ restaurantId });
    return res
        .status(200)
        .json(new ApiResponse(200, "Order history cleared successfully", {}));
});


export {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrderByStatus,
    updateOrderStatus,
    clearOrderHistory
};
