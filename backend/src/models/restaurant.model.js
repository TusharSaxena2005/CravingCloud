import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const restaurantSchema = new Schema(
    {
        code: {
            type: Number,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        contact: {
            type: Number,
            required: true,
            unique: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            unique: true,
        },
        gstNo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        logo: {
            type: String,
            required: true,
        },
        managerPassword: {
            type: String,
            required: true,
        },
        ownerPassword: {
            type: String,
            required: true,
        },
        kitchenPassword: {
            type: String,
            required: true,
        },
        tables: {
            type: Number,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        minRewardAmount:{
            type: Number,
            default: 500,
        }
    },
    {
        timestamps: true,
    }
);

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);