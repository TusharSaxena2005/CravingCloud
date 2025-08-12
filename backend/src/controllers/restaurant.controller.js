import { Restaurant } from '../models/restaurant.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadImageToFirebase, deleteImageFromFirebase } from '../utils/cloudStorage.js';

// Create Restaurant
const registerRestaurant = asyncHandler(async (req, res) => { });

// Login Restaurant
const loginRestaurant = asyncHandler(async (req, res) => { });

// Logout Restaurant
const logoutRestaurant = asyncHandler(async (req, res) => { });

// Get current Restaurant details
const getCurrentRestaurantDetails = asyncHandler(async (req, res) => { });

// Get Restaurant details by ID
const getRestaurantById = asyncHandler(async (req, res) => { });

// Change Restaurant details
const changeRestaurantDetails = asyncHandler(async (req, res) => { });

// Change Restaurant logo
const changeRestaurantLogo = asyncHandler(async (req, res) => { });

// Change Restaurant password
const changeRestaurantPassword = asyncHandler(async (req, res) => { });

// Delete Restaurant
const deleteRestaurant = asyncHandler(async (req, res) => { });

export {
    registerRestaurant,
    loginRestaurant,
    logoutRestaurant,
    getCurrentRestaurantDetails,
    getRestaurantById,
    changeRestaurantDetails,
    changeRestaurantLogo,
    changeRestaurantPassword,
    deleteRestaurant
}