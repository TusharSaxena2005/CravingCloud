import mongoose, { isValidObjectId } from "mongoose";
import Kitchen from "../models/kitchen.model.js";
import OrderHistory from '../models/orderhistory.model.js';
import Restaurant from "../models/restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Delete item from kitchen queue
const deleteItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, 'Invalid kitchen item ID');
    }
    const kitchenItem = await Kitchen.findById(id);
    if (!kitchenItem) {
        throw new ApiError(404, 'Kitchen item not found');
    }
    await kitchenItem.remove();
    return res
        .status(200)
        .json(new ApiResponse(200, 'Kitchen item deleted successfully', {}));
});

// Get all items in kitchen queue
const getAllItems = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    if (!isValidObjectId(restaurantId)) {
        throw new ApiError(400, 'Invalid restaurant ID');
    }
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        throw new ApiError(404, 'Restaurant not found');
    }
    const kitchenItems = await Kitchen.find({ restaurantId }).populate('order');
    return res
        .status(200)
        .json(new ApiResponse(200, 'Kitchen items fetched successfully', kitchenItems));
});

// Update item status in kitchen queue
const updateItemStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, 'Invalid kitchen item ID');
    }
    const kitchenItem = await Kitchen.findById(id);
    if (!kitchenItem) {
        throw new ApiError(404, 'Kitchen item not found');
    }
    const order = await OrderHistory.findById(kitchenItem.order);
    order.status = status;
    await order.save();
    if (status == 'Completed') {
        await kitchenItem.remove();
    }
    return res
        .status(200)
        .json(new ApiResponse(200, 'Kitchen item status updated successfully', kitchenItem));
});


export {
    deleteItem,
    getAllItems,
    updateItemStatus
};