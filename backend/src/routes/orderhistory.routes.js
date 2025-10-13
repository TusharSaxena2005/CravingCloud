import { Router } from "express";
import { createOrder, getAllOrders, getOrderById, getOrderByStatus, updateOrderStatus, clearOrderHistory } from "../controllers/orderhistory.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const orderHistoryRouter = Router();
orderHistoryRouter.use(protect);

orderHistoryRouter.post("/create", createOrder);
orderHistoryRouter.get("/all", getAllOrders);
orderHistoryRouter.get("/:id", getOrderById);
orderHistoryRouter.get("/status/:status", getOrderByStatus);
orderHistoryRouter.put("/update/:id", updateOrderStatus);
orderHistoryRouter.delete("/clear", clearOrderHistory);

export default orderHistoryRouter;