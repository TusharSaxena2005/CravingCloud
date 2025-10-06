import mongoose, { isValidObjectId } from "mongoose";
import { Menu } from '../models/menu.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadImageToFirebase, deleteImageFromFirebase } from '../utils/cloudStorage.js'
import { getStoragePathFromUrl } from '../utils/getStoragePath.js'


// Add item in menu
const addItem = asyncHandler(async (req, res) => {
    const { name, description, recipe, price, category, isVeg } = req.body;

    if ([name, description, recipe, price, category, isVeg].some(field => field?.trim() === "")) {
        return new ApiError(400, "All fields are required");
    }

    const existanceChecker = await Menu.findOne({ name });

    if (existanceChecker) {
        return new ApiError(400, "Menu item with this name already exists");
    }

    let image;
    if (req.file?.path) {
        image = await uploadImageToFirebase(req.file.path);
        if (!image.url) {
            return new ApiError(400, "Image upload failed");
        }
    }

    const menuItem = await Menu.create({
        name,
        description,
        recipe,
        price,
        category,
        isVeg,
        image: image.url,
        restaurantId: req.params.restaurantId
    });

    if (!menuItem) {
        return new ApiError(400, "Menu item creation failed");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, "Menu item added successfully", menuItem));
});

// Get all items in menu
const getAllItems = asyncHandler(async (req, res) => {
    const menuItems = await Menu.find();
    if (!menuItems || menuItems.length == 0) {
        return new ApiError(404, "No items in menu found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "All items are fetched from menu", menuItems)
        )
})

// Get item by ID
const getItemById = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    if (!itemId || !isValidObjectId(itemId)) {
        return new ApiError(400, "Invalid item id");
    }

    const itemDetails = await Menu.findById(itemId);
    if (!itemDetails) {
        return new ApiError(404, "Item not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Item details successfully fetched", itemDetails)
        )
})

// Get item by filter
const getItemByFilter = asyncHandler(async (req, res) => {
    const { name, category, isVeg } = req.query;
    const filter = {};
    if (name) {
        filter.name = { $regex: name, $options: "i" };
    }
    if (category) {
        filter.category = category;
    }
    if (isVeg !== undefined) {
        filter.isVeg = isVeg;
    }

    const menuItems = await Menu.find(filter);

    return res
        .status(200)
        .json(new ApiResponse(200, "Items retrieved successfully", menuItems));
});

// Update item by ID
const updateItemDetails = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    if (!itemId || !isValidObjectId(itemId)) {
        return new ApiError(400, "Invalid item id");
    }

    const { name, description, recipe, price, category, isVeg } = req.body;

    if (!name && !description && !recipe && !price && !category && !isVeg) {
        return new ApiError(400, "Atleast one field is required");
    }

    const updatedDetails = await Menu.findByIdAndUpdate(itemId,
        {
            name,
            description,
            price,
            recipe,
            category,
            isVeg
        },
        {
            new: true
        }
    );

    if (!updateItemDetails) {
        return new ApiError(400, "Item not updated");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Item details successfully updated", updatedDetails)
        )
})

// Update item image
const updateItemImage = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    if (!itemId || !isValidObjectId(itemId)) {
        return new ApiError(400, "Invalid item id");
    }

    const existingImageUrl = await Menu.findById(itemId).select('image');

    let image;
    if (req.file?.path) {
        const deleteImagePath = await getStoragePathFromUrl(existingImageUrl);
        await deleteImageFromFirebase(deleteImagePath);
        image = await uploadImageToFirebase(req.file.path);
        if (!image.url) {
            return new ApiError(400, "Image upload failed");
        }
    }

    const updatedItem = await Menu.findByIdAndUpdate(itemId, { image: image.url }, { new: true });
    if (!updatedItem) {
        return new ApiError(400, "Item not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Item image successfully updated", updatedItem)
        )
})

// Toggle for item avaliablity
const toggleItemStatus = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    if (!itemId || !isValidObjectId(itemId)) {
        return new ApiError(400, "Invalid item id");
    }

    const itemDetails = await Menu.findById(itemId);
    if (!itemDetails) {
        return new ApiError(404, "Item not found")
    }

    itemDetails.isAvailable = !itemDetails.isAvailable;

    try {
        await itemDetails.save();
    } catch (error) {
        new ApiError(500, "Unable to update item status");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, `Item is now ${itemDetails.isAvailable ? 'available' : 'unavailable'}`, {})
        )
})

// Delete item by ID
const deleteItemById = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    if (!itemId || !isValidObjectId(itemId)) {
        return new ApiError(400, "Invalid item id");
    }

    const itemDetails = await Menu.findById(itemId);
    if (!itemDetails) {
        return new ApiError(404, "Item not found");
    }

    const deleteImagePath = await getStoragePathFromUrl(itemDetails.image);
    await deleteImageFromFirebase(deleteImagePath);

    try {
        await Menu.findByIdAndDelete(itemId);
    } catch (error) {
        return new ApiError(500, "Unable to delete item");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Item successfully deleted", {})
        )
})

export {
    addItem,
    getAllItems,
    getItemById,
    getItemByFilter,
    updateItemDetails,
    updateItemImage,
    toggleItemStatus,
    deleteItemById
}