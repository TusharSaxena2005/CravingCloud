import { Router } from "express";
import { addStaff, getAllStaff, getStaffDetailsByID, changeStaffDetails, deleteStaff } from "../controllers/staff.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const staffRouter = Router();
staffRouter.use(protect);

staffRouter.post("/add", addStaff);
staffRouter.get("/all", getAllStaff);
staffRouter.get("/getstaff/:staffId", getStaffDetailsByID);
staffRouter.put("/changedetails/:staffId", changeStaffDetails);
staffRouter.delete("/delete/:staffId", deleteStaff);

export default staffRouter;