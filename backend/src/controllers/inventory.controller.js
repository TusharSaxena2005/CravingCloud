import mongoose, { isValidObjectId } from 'mongoose';
import { Restaurant } from '../models/restaurant.model.js';
import { Inventory } from '../models/inventory.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

// Create Inventory
const createInventory = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { inventoryDescription, totalCost } = req.body;

    if (!isValidObjectId(restaurantId)) {
        return next(new ApiError('Invalid restaurant ID', 400));
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(new ApiError('Restaurant not found', 404));
    }

    const inventory = await Inventory.create({
        inventoryDescription,
        totalCost,
        restaurantId
    });

    return res
        .status(201)
        .json(new ApiResponse(201, "Inventory created successfully", inventory));
});

// Get Inventory by Restaurant ID
const getInventoryByRestaurant = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;

    if (!isValidObjectId(restaurantId)) {
        return new ApiError('Invalid restaurant ID', 400);
    }

    const inventory = await Inventory.find({ restaurantId });

    return res
        .status(200)
        .json(new ApiResponse(200, "Inventory retrieved successfully", inventory));
});

// Get Single Inventory by ID
const getInventoryById = asyncHandler(async (req, res) => {
    const { inventoryId } = req.params;

    if (!isValidObjectId(inventoryId)) {
        return new ApiError('Invalid inventory ID', 400);
    }

    const inventory = await Inventory.findById(inventoryId);

    if (!inventory) {
        return new ApiError('Inventory not found', 404);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Inventory retrieved successfully", inventory));
});

// Update Inventory
const updateInventory = asyncHandler(async (req, res) => {
    const { inventoryId } = req.params;
    const { inventoryDescription, totalCost } = req.body;

    if (!isValidObjectId(inventoryId)) {
        return new ApiError('Invalid inventory ID', 400);
    }

    if (inventoryDescription && Array.isArray(inventoryDescription)) {
        for (const item of inventoryDescription) {
            if (!item.itemName || !item.price || !item.weight) {
                return new ApiError('Each inventory item must have itemName, price, and weight', 400);
            }
            if (item.price < 0 || item.weight < 0) {
                return new ApiError('Price and weight must be non-negative', 400);
            }
        }
    }

    const updateData = {};
    if (inventoryDescription) updateData.inventoryDescription = inventoryDescription;
    if (totalCost !== undefined) updateData.totalCost = totalCost;

    const inventory = await Inventory.findByIdAndUpdate(
        inventoryId,
        updateData,
        {
            new: true
        }
    );

    if (!inventory) {
        return new ApiError('Inventory not found', 404);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Inventory updated successfully", inventory));
});

// Add Item to Inventory
const addItemToInventory = asyncHandler(async (req, res) => {
    const { inventoryId } = req.params;
    const { itemName, price, weight } = req.body;

    if (!isValidObjectId(inventoryId)) {
        return new ApiError('Invalid inventory ID', 400);
    }

    if (!itemName || !price || !weight) {
        return new ApiError('itemName, price, and weight are required', 400);
    }

    if (price < 0 || weight < 0) {
        return new ApiError('Price and weight must be non-negative', 400);
    }

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
        return new ApiError('Inventory not found', 404);
    }

    inventory.inventoryDescription.push({ itemName, price, weight });

    const newTotalCost = inventory.inventoryDescription.reduce((sum, item) => sum + (item.price * item.weight), 0);
    inventory.totalCost = newTotalCost;

    await inventory.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Item added to inventory successfully", inventory));
});

// Remove Item from Inventory
const removeItemFromInventory = asyncHandler(async (req, res) => {
    const { inventoryId, itemId } = req.params;

    if (!isValidObjectId(inventoryId) || !isValidObjectId(itemId)) {
        return new ApiError('Invalid inventory ID or item ID', 400);
    }

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
        return new ApiError('Inventory not found', 404);
    }

    inventory.inventoryDescription = inventory.inventoryDescription.filter(
        item => item._id.toString() !== itemId
    );

    const newTotalCost = inventory.inventoryDescription.reduce((sum, item) => sum + (item.price * item.weight), 0);
    inventory.totalCost = newTotalCost;

    await inventory.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Item removed from inventory successfully", inventory));
});

// Delete Entire Inventory
const deleteInventory = asyncHandler(async (req, res) => {
    const { inventoryId } = req.params;

    if (!isValidObjectId(inventoryId)) {
        return new ApiError('Invalid inventory ID', 400);
    }

    const inventory = await Inventory.findByIdAndDelete(inventoryId);

    if (!inventory) {
        return new ApiError('Inventory not found', 404);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Inventory deleted successfully", {}));
});

export {
    createInventory,
    getInventoryByRestaurant,
    getInventoryById,
    updateInventory,
    addItemToInventory,
    removeItemFromInventory,
    deleteInventory
};

