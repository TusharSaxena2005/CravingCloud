import { Router } from "express";
import { deleteItem, getAllItems, updateItemStatus } from "../controllers/kitchen.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const kitchenRouter = Router();
kitchenRouter.use(protect);

kitchenRouter.delete("/delete/:id", deleteItem);
kitchenRouter.get("/all", getAllItems);
kitchenRouter.put("/update/:id", updateItemStatus);

export default kitchenRouter;