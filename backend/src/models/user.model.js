import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender:{
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    orderHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderHistory'
    }],
    password: {
        type: String,
        required: true,
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
            phone: this.phone
        },
        process.env.access_token_secret,
        {
            expiresIn: process.env.access_token_expiry
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
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

export const User = mongoose.model('User', userSchema);