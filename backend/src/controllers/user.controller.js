import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

// Create user
const createUser = asyncHandler(async (req, res) => {
    const { name, email, phone, dob, password, gender } = req.body;
    if ([name, email, phone, dob, password, gender].some((field) => field?.trim() === "")) {
        return new ApiError("All fields are required", 400);
    }
    if (await User.findOne({ email })) {
        return new ApiError("Email already in use", 400);
    }
    const user = await User.create(
        {
            name,
            email,
            phone,
            dob,
            password,
            gender
        }
    );

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    }

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(201, "User created successfully", user));
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return new ApiError("Email and password are required", 400);
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        return new ApiError("Invalid email or password", 401);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, "User logged in successfully", user));
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
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
        .json(new ApiResponse(200, "User logged out successfully"));
});

// Get current user details
const getCurrentUserDetails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
        return new ApiError("User not found", 404);
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "User retrieved successfully", user));
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return new ApiError("Invalid user ID", 400);
    }
    const user = await User.findById(id);
    if (!user) {
        return new ApiError("User not found", 404);
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "User retrieved successfully", user));
});

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    return res
        .status(200)
        .json(new ApiResponse(200, "Users retrieved successfully", users));
});

// Update user details
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, phone, dob, gender } = req.body;
    if (!email && !phone && !dob && !gender) {
        return new ApiError("At least one field is required to update", 400);
    }

    if (email) {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== id) {
            return new ApiError("Email already in use", 400);
        }
    }

    if (!isValidObjectId(id)) {
        return new ApiError("Invalid user ID", 400);
    }
    const user = await User.findByIdAndUpdate(id, { email, phone, dob, gender }, { new: true });
    if (!user) {
        return new ApiError("User not found", 404);
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "User updated successfully", user));
});

// Change user password
const changeUserPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    if (!isValidObjectId(id)) {
        return new ApiError("Invalid user ID", 400);
    }
    const user = await User.findById(id);
    if (!user) {
        return new ApiError("User not found", 404);
    }
    if (!(await user.comparePassword(oldPassword))) {
        return new ApiError("Old password is incorrect", 400);
    }
    user.password = newPassword;
    await user.save();
    return res
        .status(200)
        .json(new ApiResponse(200, "Password changed successfully", user));
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return new ApiError("Invalid user ID", 400);
    }
    const user = await User.findByIdAndDelete(id);
    return res
        .status(200)
        .json(new ApiResponse(200, "User deleted successfully", user));
});

export {
    createUser,
    loginUser,
    logoutUser,
    getCurrentUserDetails,
    getUserById,
    getAllUsers,
    updateUser,
    changeUserPassword,
    deleteUser
} 