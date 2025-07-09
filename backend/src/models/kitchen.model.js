import mongoose, { Schema } from "mongoose";

const kitchenSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        },
    },
    {
        timestamps: true
    });