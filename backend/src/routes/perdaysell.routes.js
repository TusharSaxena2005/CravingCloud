import { Router } from "express";
import { createPerDaySell, getTodayPerDaySell, getPerDaySellByDate, filterPerDaySellByDate, getAllPerDaySellRecords } from "../controllers/perdaysell.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const perDaySellRouter = Router();
perDaySellRouter.use(protect);

perDaySellRouter.post("/create", createPerDaySell);
perDaySellRouter.get("/today", getTodayPerDaySell);
perDaySellRouter.get("/bydate/:date", getPerDaySellByDate);
perDaySellRouter.get("/filter", filterPerDaySellByDate);
perDaySellRouter.get("/all", getAllPerDaySellRecords);

export default perDaySellRouter;
