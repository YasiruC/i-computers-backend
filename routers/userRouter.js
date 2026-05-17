import express from 'express';
import { createUser, getUserDetails, googleLogin, loginUser, sendOTP, updatePassword, updateUserDetails, verifyOTPAndResetPassword } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register",createUser);
userRouter.post("/login",loginUser);
userRouter.post("/google-login",googleLogin);
userRouter.get("/profile",getUserDetails);
userRouter.put("/",updateUserDetails);
userRouter.put("/password",updatePassword);
userRouter.post("/send-otp",sendOTP);
userRouter.post("/reset-password",verifyOTPAndResetPassword);

export default userRouter;