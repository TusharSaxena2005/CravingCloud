import mongoose, { Schema } from "mongoose";

const orderHistorySchema = new mongoose.Schema(
    {
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        items: [
            {
                menuItemId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Menu',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                }
            }
        ],
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Cancelled'],
            default: 'Pending'
        },
        tableNo: {
            type:Schema.Types.ObjectId,
            ref: 'Table',
            required: true
        },
    },
    {
        timestamps: true
    }
);

export const OrderHistory = mongoose.model('OrderHistory', orderHistorySchema);