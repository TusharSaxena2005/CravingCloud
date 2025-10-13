import { Router } from "express";
import { createUser, loginUser, logoutUser, getCurrentUserDetails, getUserById, getAllUsers, updateUser, changeUserPassword, deleteUser } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const userRouter = Router();
userRouter.use(protect);

userRouter.post("/signup", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.get("/current", getCurrentUserDetails);
userRouter.get("/getuser/:id", getUserById);
userRouter.get("/getall", getAllUsers);
userRouter.put("/update/:id", updateUser);
userRouter.patch("/changepassword/:id", changeUserPassword);
userRouter.delete("/deleteuser/:id", deleteUser);

export default userRouter;