import { Restaurant } from '../models/restaurant.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { getStoragePathFromUrl } from '../utils/getStoragePath.js';
import { uploadImageToFirebase, deleteImageFromFirebase } from '../utils/cloudStorage.js';

const generateAccessAndRefreshToken = async (restaurant) => {
    try {
        const accessToken = await restaurant.generateAccessToken();
        const refreshToken = await restaurant.generateRefreshToken();

        restaurant.refreshToken = refreshToken;
        await restaurant.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(505, "Something went wrong while creating new token");
    }
}

// Create Restaurant
const registerRestaurant = asyncHandler(async (req, res) => {
    const { gstNo, code, name, email, contact, address, gstTaxAmount, managerPassword, ownerPassword, kitchenPassword, isActive, minRewardAmount } = req.body;

    if ([gstNo, code, name, email, contact, address, gstTaxAmount, managerPassword, ownerPassword, kitchenPassword, isActive, minRewardAmount].some((field) => field?.trim() === "")) {
        return new ApiError(400, "All fields are required");
    }

    const checkExistance = await Restaurant.findOne({ $or: [{ gstNo }, { code }, { email }, { contact }, { address }] });
    if (checkExistance) {
        return new ApiError(400, "Restaurant with similar details already exists");
    }

    let logoPath;
    let logoPic;
    if (req.file && Array.isArray(req.files.logo) && req.files.logo.length > 0) {
        logoPath = await req.files.logo[0].path;
        logoPic = await uploadImageToFirebase(logoPath);
    }

    const restaurant = await Restaurant.create({
        gstNo,
        code,
        name,
        email,
        contact,
        address,
        gstTaxAmount,
        managerPassword,
        ownerPassword,
        kitchenPassword,
        isActive,
        minRewardAmount,
        accessToken,
        refreshToken,
        logo: logoPic.url
    });

    const { accessToken, refreshToken } = generateTokens(restaurant);

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    }

    return res
        .status(201)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(201, "Restaurant registered successfully", restaurant)
        );
});

// Login Restaurant
const loginRestaurant = asyncHandler(async (req, res) => {
    const { code, role, password } = req.body;
    if ([code, role, password].some((field) => field?.trim() === "")) {
        return new ApiError(400, "All fields are required");
    }

    const restaurant = await Restaurant.findOne({ code });
    if (!restaurant) {
        return new ApiError(404, "Restaurant not found");
    }

    const isMatch = await restaurant.comparePassword(password, role);
    if (!isMatch) {
        return new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(restaurant);
    const logginedUser = await restaurant.findById(restaurant._id).select("-managerPassword -ownerPassword -kitchenPassword -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, "Restaurant logged in successfully", logginedUser)
        );
});

// Logout Restaurant
const logoutRestaurant = asyncHandler(async (req, res) => {
    await Restaurant.findByIdAndUpdate(req.restaurant._id, {
        $unset: { refreshToken: 1 }
    });

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    };

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Get current Restaurant details
const getCurrentRestaurantDetails = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "Current restaurant details fetched successfully", req.restaurant));
});

// Get all Restaurant details
const getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find().select("-managerPassword -ownerPassword -kitchenPassword -refreshToken");

    if (!restaurants || restaurants.length == 0) {
        return new ApiError(404, "No restaurants found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "All restaurant details fetched successfully", restaurants));
});

// Get Restaurant details by ID
const getRestaurantById = asyncHandler(async (req, res) => {
    const { name } = req.params;
    if (!name) {
        return new ApiError(400, "Restaurant name is required");
    }
    const restaurant = await Restaurant.findMany({ name }).select("-managerPassword -ownerPassword -kitchenPassword -refreshToken");
    if (!restaurant) {
        return new ApiError(404, "Restaurant not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Restaurant details fetched successfully", restaurant));
});

// Change Restaurant details
const changeRestaurantDetails = asyncHandler(async (req, res) => {
    const { name, email, contact, address, gstTaxAmount, isActive, minRewardAmount } = req.body;

    if (!name && !email && !contact && !address && !gstTaxAmount && !isActive && !minRewardAmount) {
        return new ApiError(400, "Atleast one field is required");
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        req.restaurant._id,
        {
            $set: {
                name,
                email,
                contact,
                address,
                gstTaxAmount,
                isActive,
                minRewardAmount
            }
        },
        { new: true });

    if (!updatedRestaurant) {
        return new ApiError(404, "Restaurant not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Restaurant details updated successfully", updatedRestaurant));
});

// Change Restaurant logo
const changeRestaurantLogo = asyncHandler(async (req, res) => {
    const logo = req.files?.path;
    if (!logo) {
        return new ApiError(400, "Logo image is required");
    }

    const logoPic = await uploadImageToFirebase(logo);

    const currentPicUrl = await Restaurant.findById(req.restaurant._id).select("logo");

    const currentPicPath = await getStoragePathFromUrl(currentPicUrl);

    if (currentPicPath) {
        await deleteImageFromFirebase(currentPicPath);
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        req.restaurant._id,
        {
            $set: {
                logo: logoPic.url
            }
        },
        { new: true }
    );

    if (!updatedRestaurant) {
        return new ApiError(404, "Restaurant not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Restaurant logo updated successfully", updatedRestaurant));
});

// Change Restaurant password 
const changeRestaurantPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, role } = req.body;

    if (!currentPassword || !newPassword) {
        return new ApiError(400, "Current and new password are required");
    }

    if (currentPassword == newPassword) {
        return new ApiError(400, "New password must be different from current password");
    }

    const restaurant = await Restaurant.findById(req.restaurant._id);
    if (!restaurant) {
        return new ApiError(404, "Restaurant not found");
    }

    const isMatch = await restaurant.comparePassword(currentPassword, role);
    if (!isMatch) {
        return new ApiError(401, "Current password is incorrect");
    }

    if (role == "manager") {
        restaurant.managerPassword = newPassword;
    } else if (role == "owner") {
        restaurant.ownerPassword = newPassword;
    } else if (role == "kitchen") {
        restaurant.kitchenPassword = newPassword;
    }

    await restaurant.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Password updated successfully"));
});

// Delete Restaurant
const deleteRestaurant = asyncHandler(async (req, res) => {
    const restaurantLogo = await Restaurant.findById(req.restaurant._id).select("logo");
    if (restaurantLogo) {
        const currentPicPath = await getStoragePathFromUrl(restaurantLogo);
        if (currentPicPath) {
            await deleteImageFromFirebase(currentPicPath);
        }
    }

    await Restaurant.findByIdAndDelete(req.restaurant._id);
    return res
        .status(200)
        .json(new ApiResponse(200, "Restaurant deleted successfully"));
});

export {
    registerRestaurant,
    loginRestaurant,
    logoutRestaurant,
    getCurrentRestaurantDetails,
    getAllRestaurants,
    getRestaurantById,
    changeRestaurantDetails,
    changeRestaurantLogo,
    changeRestaurantPassword,
    deleteRestaurant
}