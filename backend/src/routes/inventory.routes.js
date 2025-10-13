import { Router } from "express";
import { createInventory, getInventoryByRestaurant, getInventoryById, updateInventory, addItemToInventory, removeItemFromInventory, deleteInventory } from "../controllers/inventory.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const inventoryRouter = Router();
inventoryRouter.use(protect);

inventoryRouter.post("/create", createInventory);
inventoryRouter.get("/restaurant/:restaurantId", getInventoryByRestaurant);
inventoryRouter.get("/:id", getInventoryById);
inventoryRouter.put("/update/:id", updateInventory);
inventoryRouter.post("/add/:id/items", addItemToInventory);
inventoryRouter.delete("/remove/:id/items/:itemId", removeItemFromInventory);
inventoryRouter.delete("/delete/:id", deleteInventory);

export default inventoryRouter;