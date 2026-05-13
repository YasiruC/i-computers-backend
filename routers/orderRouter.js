import express from "express";
import { createOrder, getOrder } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/",createOrder);
orderRouter.get("/:pageSize/:pageNum",getOrder);

export default orderRouter;