import { Router } from "express";
import { registerRestaurant, loginRestaurant, logoutRestaurant, getCurrentRestaurantDetails, getAllRestaurants, getRestaurantById, changeRestaurantDetails, changeRestaurantLogo, changeRestaurantPassword, deleteRestaurant } from "../controllers/restaurant.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const restaurantRouter = Router();
restaurantRouter.use(protect);

restaurantRouter.post("/register", uploadSingleImage.single("logo"), registerRestaurant);
restaurantRouter.post("/login", loginRestaurant);
restaurantRouter.post("/logout", logoutRestaurant);
restaurantRouter.get("/current", getCurrentRestaurantDetails);
restaurantRouter.get("/all", getAllRestaurants);
restaurantRouter.get("/getrestaurant/:id", getRestaurantById);
restaurantRouter.put("/changedetails/:id", changeRestaurantDetails);
restaurantRouter.patch("/logo/:id", uploadSingleImage.single("logo"), changeRestaurantLogo);
restaurantRouter.patch("/password/:id", changeRestaurantPassword);
restaurantRouter.delete("/delete/:id", deleteRestaurant);

export default restaurantRouter;