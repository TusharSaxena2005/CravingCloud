import mongoose, { Schema } from "mongoose";

const kitchenSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: 'OrderHistory',
            required: true
        }
    },
    {
        timestamps: true
    });

export const Kitchen = mongoose.model('Kitchen', kitchenSchema);