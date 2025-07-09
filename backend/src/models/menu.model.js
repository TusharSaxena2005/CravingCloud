import mongoose, { Schema } from "mongoose";

const menuSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        recipe: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: String,
            required: true,
            enum: ['Snacks', 'Main Course', 'Dessert', 'Drinks', 'Salads', 'Soups'],
            trim: true
        },
        image: {
            type: String,
            required: true,
            trim: true
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        isVeg: {
            type: Boolean,
            default: true
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        }
        ,
    },
    {
        timestamps: true
    }
);

export const Menu = mongoose.model('Menu', menuSchema);