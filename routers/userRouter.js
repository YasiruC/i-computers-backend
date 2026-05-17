import express from 'express';
import { createUser, getUserDetails, loginUser, updatePassword, updateUserDetails } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register",createUser);
userRouter.post("/login",loginUser);
userRouter.get("/profile",getUserDetails);
userRouter.put("/",updateUserDetails);
userRouter.put("/password",updatePassword);

export default userRouter;