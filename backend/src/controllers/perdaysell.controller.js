import mongoose, { isValidObjectId } from 'mongoose';
import { PerDaySell } from '../models/perdaysell.model.js';
import { Restaurant } from '../models/restaurant.model.js';
import { Inventory } from '../models/inventory.model.js';
import { OrderHistory } from '../models/orderhistory.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

// Helper functions to get start and end of day
const getStartOfDay = (date = new Date()) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
};

const getEndOfDay = (date = new Date()) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
};

// Create a new per day sell record
const createPerDaySell = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;

    if (!isValidObjectId(restaurantId)) {
        return new ApiError(400, 'Invalid restaurant ID');
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return new ApiError(404, 'Restaurant not found');
    }

    const targetDate = new Date();
    const startOfDay = getStartOfDay(targetDate);
    const endOfDay = getEndOfDay(targetDate);

    // Fetch today's orders for the restaurant
    const todayOrders = await OrderHistory.find({
        restaurantId: restaurantId,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    // Fetch today's inventory for the restaurant
    const todayInventory = await Inventory.find({
        restaurantId: restaurantId,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    // Calculate totalSell = Add price of all today orders
    const totalSell = todayOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Calculate totalInventoryCost = Add price of all today inventory
    const totalInventoryCost = todayInventory.reduce((acc, inventory) => acc + inventory.totalCost, 0);

    // Calculate totalProfit = totalSell - totalInventoryCost
    const totalProfit = totalSell - totalInventoryCost;

    // Count total orders
    const totalOrders = todayOrders.length;

    // Check if record already exists for this date
    const existingRecord = await PerDaySell.findOne({
        restaurantId: restaurantId,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    let perDaySell;

    if (existingRecord) {
        // Update existing record
        perDaySell = await PerDaySell.findByIdAndUpdate(
            existingRecord._id,
            {
                totalSell,
                profit: totalProfit,
                inventoryCost: totalInventoryCost, // Note: This should be a number, not ObjectId as per your model
                totalOrders
            },
            { new: true }
        );
    } else {
        // Create new record
        perDaySell = await PerDaySell.create({
            restaurantId,
            totalSell,
            profit: totalProfit,
            inventoryCost: totalInventoryCost,
            totalOrders
        });

        perDaySell = await PerDaySell.findById(perDaySell._id);
    }

    res.status(201).json(new ApiResponse(201, 'Per day sell record created/updated successfully', {
        perDaySell,
        calculation: {
            totalSell,
            totalInventoryCost,
            totalProfit,
            totalOrders,
            date: targetDate.toDateString()
        }
    }));
});

// Get today per day sell record
const getTodayPerDaySell = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;

    if (!isValidObjectId(restaurantId)) {
        return new ApiError(400, 'Invalid restaurant ID');
    }

    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    const todayRecord = await PerDaySell.findOne({
        restaurantId: restaurantId,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, 'Today per day sell record retrieved successfully', todayRecord));
});

// Get per day sell record by specific date
const getPerDaySellByDate = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { date } = req.query;

    if (!isValidObjectId(restaurantId)) {
        return new ApiError(400, 'Invalid restaurant ID');
    }

    if (!date) {
        return new ApiError(400, 'Date parameter is required');
    }

    const targetDate = new Date(date);
    const startOfDay = getStartOfDay(targetDate);
    const endOfDay = getEndOfDay(targetDate);

    const record = await PerDaySell.findOne({
        restaurantId: restaurantId,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, 'Per day sell record retrieved successfully', record));
});

// Filter per day sell records by date range
const filterPerDaySellByDate = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { startDate, endDate } = req.query;

    if (!isValidObjectId(restaurantId)) {
        return new ApiError(400, 'Invalid restaurant ID');
    }

    if (!startDate || !endDate) {
        return new ApiError(400, 'Both startDate and endDate parameters are required');
    }

    const start = getStartOfDay(new Date(startDate));
    const end = getEndOfDay(new Date(endDate));

    if (start > end) {
        return new ApiError(400, 'Start date cannot be later than end date');
    }

    const records = await PerDaySell.find({
        restaurantId: restaurantId,
        createdAt: {
            $gte: start,
            $lte: end
        }
    }).sort({ createdAt: -1 });

    // Calculate summary for the date range
    const summary = {
        totalRecords: records.length,
        totalSellSum: records.reduce((sum, record) => sum + record.totalSell, 0),
        totalProfitSum: records.reduce((sum, record) => sum + record.profit, 0),
        totalInventoryCostSum: records.reduce((sum, record) => sum + record.inventoryCost, 0),
        totalOrdersSum: records.reduce((sum, record) => sum + record.totalOrders, 0),
        dateRange: {
            from: start.toDateString(),
            to: end.toDateString()
        }
    };

    return res
        .status(200)
        .json(new ApiResponse(200, 'Per day sell records filtered successfully', {
            records,
            summary
        }));
});

// Get all per day sell records for a restaurant
const getAllPerDaySellRecords = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(restaurantId)) {
        return new ApiError(400, 'Invalid restaurant ID');
    }

    const skip = (page - 1) * limit;

    const records = await PerDaySell.find({ restaurantId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalRecords = await PerDaySell.countDocuments({ restaurantId });

    return res
        .status(200)
        .json(new ApiResponse(200, 'All per day sell records retrieved successfully', {
            records,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalRecords / limit),
                totalRecords,
                hasNext: page * limit < totalRecords,
                hasPrev: page > 1
            }
        }));
});

export {
    createPerDaySell,
    getTodayPerDaySell,
    getPerDaySellByDate,
    filterPerDaySellByDate,
    getAllPerDaySellRecords
};