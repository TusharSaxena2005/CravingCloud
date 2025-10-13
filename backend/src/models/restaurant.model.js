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
        gstTaxAmount: {
            type: Number,
            required: true,
            default: 0,
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
        isActive: {
            type: Boolean,
            default: true,
        },
        minRewardAmount: {
            type: Number,
            default: 500,
        },
        tables: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Table',
            }
        ],
        staff: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Staff',
            }
        ],
        menu: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Menu',
            }
        ],
        inventory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Inventory',
            }
        ],
        orderHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'OrderHistory',
            }
        ],
        kitchen: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Kitchen',
            }
        ],
        perDaySell: [
            {
                type: Schema.Types.ObjectId,
                ref: 'PerDaySell',
            }
        ],
        refreshToken: {
            type: String,
            required: true,
        },
        accessToken: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

restaurantSchema.pre("save", async function (next) {
    if (this.isModified("managerPassword")) return next();
    if (this.isModified("ownerPassword")) return next();
    if (this.isModified("kitchenPassword")) return next();
    this.managerPassword = await bcrypt.hash(this.managerPassword, 10);
    this.ownerPassword = await bcrypt.hash(this.ownerPassword, 10);
    this.kitchenPassword = await bcrypt.hash(this.kitchenPassword, 10);
    next();
});

restaurantSchema.methods.comparePassword = async function (password, role) {
    if (role === "manager") {
        return await bcrypt.compare(password, this.managerPassword);
    } else if (role === "owner") {
        return await bcrypt.compare(password, this.ownerPassword);
    } else if (role === "kitchen") {
        return await bcrypt.compare(password, this.kitchenPassword);
    }
};

restaurantSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
            contact: this.contact
        },
        process.env.access_token_secret,
        {
            expiresIn: process.env.access_token_expiry
        }
    )
}

restaurantSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.refresh_token_secret,
        {
            expiresIn: process.env.refresh_token_expiry
        }
    )
}

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);