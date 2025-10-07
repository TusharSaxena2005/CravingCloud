import mongoose, { Schema } from "mongoose";

const perDaySellSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        },
        totalSell: {
            type: Number,
            required: true,
            min: 0
        },
        profit: {
            type: Number,
            required: true,
            min: 0
        },
        inventoryCost: {
            type: Number,
            required: true,
            min: 0
        },
        totalOrders: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

export const PerDaySell = mongoose.model('PerDaySell', perDaySellSchema);