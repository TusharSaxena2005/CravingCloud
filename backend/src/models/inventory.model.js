import mongoose, { Schema } from 'mongoose';

const inventorySchema = new mongoose.Schema(
    {
        inventoryDescription: {
            itemName: {
                type: String,
                required: true,
                trim: true
            },
            price: {
                type: Number,
                required: true,
                min: 0
            },
            weight: {
                type: Number,
                required: true,
                min: 0
            }
        },
        totalCost: {
            type: Number,
            required: true,
            min: 0
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Inventory = mongoose.model('Inventory', inventorySchema);