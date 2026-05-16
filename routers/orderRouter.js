import express from "express";
import { createOrder, getOrder, updateNoteAndStatus } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/",createOrder);
orderRouter.get("/:pageSize/:pageNum",getOrder);
orderRouter.put("/:orderId",updateNoteAndStatus);

export default orderRouter;