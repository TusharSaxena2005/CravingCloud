import { Router } from 'express';
import { createTable, getAllTables, deleteTable, getTableById, updateTable } from '../controllers/table.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const tableRouter = Router();
tableRouter.use(protect);

tableRouter.post("/create", createTable);
tableRouter.get("/all", getAllTables);
tableRouter.delete("/delete/:id", deleteTable);
tableRouter.get("/getbyid/:id", getTableById);
tableRouter.put("/update/:id", updateTable);

export default tableRouter;
