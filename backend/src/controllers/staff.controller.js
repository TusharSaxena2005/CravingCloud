import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import mongoose, { isValidObjectId } from "mongoose"
import { Staff } from '../models/staff.model.js';

// Add Staff
const addStaff = asyncHandler(async (req, res) => {
    const { name, contact, email, role, gender, dob } = req.body;
    if ([name, contact, email, role, gender, dob].some((fields) => fields.trim() === '')) {
        throw new ApiError(400, "All fields are required");
    }

    const existingStaff = await Staff.findOne({ $or: [{ email }, { contact }] });

    if (existingStaff) {
        throw new ApiError(400, "Staff with this email or contact already exists");
    }

    const staff = await Staff.create({
        name,
        contact,
        email,
        role,
        gender,
        dob,
        restaurantId: req.params.restaurantId
    });

    if (!staff) {
        throw new ApiError(500, "Failed to add staff");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, "Staff added successfully", staff));
})

// Change Staff details
const changeStaffDetails = asyncHandler(async (req, res) => { })

// Delete Staff
const deleteStaff = asyncHandler(async (req, res) => { })

export {
    addStaff,
    changeStaffDetails,
    deleteStaff
}