import { Router } from "express";
import { addItem, getAllItems, getItemById, getItemByFilter, updateItemDetails, updateItemImage, toggleItemStatus, deleteItemById } from "../controllers/menu.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const menuRouter = Router();
menuRouter.use(protect);
menuRouter.post("/add", uploadSingleImage.single("image"), addItem);
menuRouter.get("/all", getAllItems);
menuRouter.get("/:id", getItemById);
menuRouter.get("/filter", getItemByFilter);
menuRouter.put("/update/:id", updateItemDetails);
menuRouter.put("/updateimage/:id/image", uploadSingleImage.single("image"), updateItemImage);
menuRouter.patch("/toggle/:id", toggleItemStatus);
menuRouter.delete("/delete/:id", deleteItemById);

export default menuRouter;