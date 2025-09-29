import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        },
        tableNo: {
            type: Number,
            required: true
        },
        floorNo:{
            type: Number,
            required: true,
            default: 0
        },
        status: {
            type: String,
            enum: ['Available', 'Occupied', 'Reserved'],
            default: 'Available'
        }
    },
    {
        timestamps: true
    }
);

export const Table = mongoose.model('Table', tableSchema);