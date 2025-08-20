import { Restaurant } from '../models/restaurant.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadImageToFirebase, deleteImageFromFirebase } from '../utils/cloudStorage.js';
import jwt from 'jsonwebtoken';
import mongoose, { isValidObjectId } from "mongoose"

const generateAccessAndRefreshToken = async (restaurant) => {
    try {
        const accessToken = await restaurant.generateAccessToken();
        const refreshToken = await restaurant.generateRefreshToken();

        restaurant.refreshToken = refreshToken;
        await restaurant.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(505, "Something went wrong while creating new token");
    }
}

// Create Restaurant
const registerRestaurant = asyncHandler(async (req, res) => {
    const { gstNo, code, name, email, contact, address, gstTaxAmount, managerPassword, ownerPassword, kitchenPassword, tables, isActive, minRewardAmount } = req.body;

    if ([gstNo, code, name, email, contact, address, gstTaxAmount, managerPassword, ownerPassword, kitchenPassword, tables, isActive, minRewardAmount].some((field) => field?.trim() === "")) {
        return new ApiError(400, "All fields are required");
    }

    const checkExistance = await Restaurant.findOne({ $or: [{ gstNo }, { code }, { email }, { contact }, { address }] });
    if (checkExistance) {
        return new ApiError(400, "Restaurant with similar details already exists");
    }

    let logoPath;
    let logoPic;
    if (req.file && Array.isArray(req.files.logo) && req.files.logo.length > 0) {
        logoPath = await req.files.logo[0].path;
        logoPic = await uploadImageToFirebase(logoPath);
    }

    const restaurant = await Restaurant.create({
        gstNo,
        code,
        name,
        email,
        contact,
        address,
        gstTaxAmount,
        managerPassword,
        ownerPassword,
        kitchenPassword,
        tables,
        isActive,
        minRewardAmount,
        accessToken,
        refreshToken,
        logo: logoPic.url
    });

    const { accessToken, refreshToken } = generateTokens(restaurant);

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    }

    return res
        .status(201)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(201, "Restaurant registered successfully", restaurant)
        );
});

// Login Restaurant
const loginRestaurant = asyncHandler(async (req, res) => {
    const { code, role, password } = req.body;
    if ([code, role, password].some((field) => field?.trim() === "")) {
        return new ApiError(400, "All fields are required");
    }

    const restaurant = await Restaurant.findOne({ code });
    if (!restaurant) {
        return new ApiError(404, "Restaurant not found");
    }

    const isMatch = await restaurant.comparePassword(password, role);
    if (!isMatch) {
        return new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(restaurant);
    const logginedUser = await restaurant.findById(restaurant._id).select("-managerPassword -ownerPassword -kitchenPassword -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, "Restaurant logged in successfully", logginedUser)
        );
});

// Logout Restaurant
const logoutRestaurant = asyncHandler(async (req, res) => {
    await Restaurant.findByIdAndUpdate(req.restaurant._id, {
        $unset: { refreshToken: 1 }
    });

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    };

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Get current Restaurant details
const getCurrentRestaurantDetails = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "Current restaurant details fetched successfully", req.restaurant));
});

// Get Restaurant details by ID
const getRestaurantById = asyncHandler(async (req, res) => {
    const { name } = req.params;
    if (!name) {
        return new ApiError(400, "Restaurant name is required");
    }
    const restaurant = await Restaurant.findMany({ name });
    if (!restaurant) {
        return new ApiError(404, "Restaurant not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Restaurant details fetched successfully", restaurant));
});

// Change Restaurant details
const changeRestaurantDetails = asyncHandler(async (req, res) => { });

// Change Restaurant logo
const changeRestaurantLogo = asyncHandler(async (req, res) => { });

// Change Restaurant password
const changeRestaurantPassword = asyncHandler(async (req, res) => { });

// Delete Restaurant
const deleteRestaurant = asyncHandler(async (req, res) => { });

export {
    registerRestaurant,
    loginRestaurant,
    logoutRestaurant,
    getCurrentRestaurantDetails,
    getRestaurantById,
    changeRestaurantDetails,
    changeRestaurantLogo,
    changeRestaurantPassword,
    deleteRestaurant
}