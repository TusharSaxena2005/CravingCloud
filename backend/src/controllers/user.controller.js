import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    return res
        .status(201)
        .json(new ApiResponse(201, "User created successfully", user));
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
    getUserById,
    getAllUsers,
    updateUser,
    changeUserPassword,
    deleteUser
}