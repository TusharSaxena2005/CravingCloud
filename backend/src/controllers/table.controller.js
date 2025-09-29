import mongoose, { isValidObjectId } from "mongoose";
import Table from "../models/table.model.js";
import Restaurant from "../models/restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new table
const createTable = asyncHandler(async (req, res) => {
    const { restaurantId, tableNo, floorNo, capacity } = req.body;
    if (!isValidObjectId(restaurantId)) {
        return new ApiError("Invalid restaurant ID", 400);
    }
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return new ApiError("Restaurant not found", 404);
    }
    const table = await Table.create({
        restaurant: restaurantId,
        tableNo,
        floorNo,
        capacity,
    });
    return res
        .status(201)
        .json(new ApiResponse(201, "Table created successfully", table));
});

// Get all tables with filtering
const getAllTables = asyncHandler(async (req, res) => {
    const { restaurantId, status, floorNo, capacity } = req.query;
    if (restaurantId && !isValidObjectId(restaurantId)) {
        return new ApiError("Invalid restaurant ID", 400);
    }
    const filter = {};
    if (restaurantId) {
        filter.restaurant = restaurantId;
    }
    if (status) {
        filter.status = status;
    }
    if (floorNo) {
        filter.floorNo = floorNo;
    }
    if (capacity) {
        filter.capacity = capacity;
    }
    const tables = await Table.find(filter);
    return res
        .status(200)
        .json(new ApiResponse(200, "All tables fetched successfully", tables));
});

// Delete a table by ID
const deleteTable = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return new ApiError("Invalid table ID", 400);
    }
    const table = await Table.findByIdAndDelete(id);
    return res
        .status(200)
        .json(new ApiResponse(200, "Table deleted successfully", {}));
});

// Get a table by ID
const getTableById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return new ApiError("Invalid table ID", 400);
    }
    const table = await Table.findById(id);
    if (!table) {
        return new ApiError("Table not found", 404);
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Table fetched successfully", table));
});

// Update a table by ID
const updateTable = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!isValidObjectId(id)) {
        return new ApiError("Invalid table ID", 400);
    }
    const table = await Table.findById(id);
    if (!table) {
        return new ApiError("Table not found", 404);
    }
    table.status = status;
    await table.save();
    return res
        .status(200)
        .json(new ApiResponse(200, "Table updated successfully", table));
});

export {
    createTable,
    getAllTables,
    deleteTable,
    getTableById,
    updateTable,
};
