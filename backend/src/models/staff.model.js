import mongoose, { Schema } from "mongoose";

const staffSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        contact: {
            type: Number,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        role: {
            type: String,
            required: true,
            enum: ['Manager', 'Cook', 'Waiter', 'Security guard', 'Cleaner'],
        },
        gender: {
            type: String,
            required: true,
            enum: ['Male', 'Female', 'Other']
        },
        dob: {
            type: Date,
            required: true
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

export const Staff = mongoose.model('Staff', staffSchema);