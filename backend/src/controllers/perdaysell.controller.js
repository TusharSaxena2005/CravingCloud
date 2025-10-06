import mongoose, { isValidObjectId } from 'mongoose';
import { PerDaySell } from '../models/perdaysell.model.js';
import { Restaurant } from '../models/restaurant.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

// Create a new per day sell record
const createPerDaySell = asyncHandler(async (req, res) => { });

// Get today per day sell record
const getTodayPerDaySell = asyncHandler(async (req, res) => { });

// Filter per day sell records by date range
const filterPerDaySellByDate = asyncHandler(async (req, res) => { });

export {
    createPerDaySell,
    getTodayPerDaySell,
    filterPerDaySellByDate
};