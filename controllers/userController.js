import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import OTP from "../models/otp.js";
import nodemailer from "nodemailer";

dotenv.config();

export function createUser(req,res){
        const hashPassword = bcrypt.hashSync(req.body.password,10);

        const newUser = new User({
            email : req.body.email,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            password :   hashPassword
        });

        newUser.save().then(()=>{
                res.json({
                    message : "Student Save Successfully."
                });
            }
        ).catch((err)=>{
                res.status(500).json({
                    message : "Student Save Unsuccessful!",
                    error: err.message
                });
            });
}

export function loginUser(req,res){
        User.findOne({
            email : req.body.email
        }).then((user)=>{
            if(user == null){
                res.status(404).json({
                    message : "User not found"
                });
            }else{
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
                if(isPasswordCorrect){

                    const payload = {
                        email : user.email,
                        firstName : user.firstName,
                        lastName : user.lastName,
                        isAdmin : user.isAdmin,
                        isBlocked : user.isBlocked,
                        isEmailVerified : user.isEmailVerified,
                        image : user.image
                    }

                    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY ,{ expiresIn : "48h" });//create token
                    res.json({
                        token : token,
                        isAdmin : user.isAdmin
                    });
                }else{
                    res.status(401).json({
                        message : "Invalid Password!"
                    });
                }
            }
        }).catch((err)=>{
            res.status(500).json({
                message: "User Login something went wrong!",
                error: err.message
            });
        });
}

export async function googleLogin(req,res){
    const accessToken = req.body.accessToken;
    // Verify the access token and get user information from Google API
    try{
        const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo?", {
            headers : { authorization : `Bearer ${accessToken}` }
        });

        const user = await User.findOne({ email : googleResponse.data.email });
        if(user){
            const payload = {
                email : user.email,
                firstName : user.firstName,
                lastName : user.lastName,
                isAdmin : user.isAdmin,
                isBlocked : user.isBlocked,
                isEmailVerified : user.isEmailVerified,
                image : user.image
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET_KEY ,{ expiresIn : "48h" });//create token
            res.json({
                token : token,
                isAdmin : user.isAdmin
            });
        }else{
            const newUser = new User({
                email : googleResponse.data.email,
                firstName : googleResponse.data.given_name,
                lastName : googleResponse.data.family_name != null ? googleResponse.data.family_name : " ",
                password : "google-login",
                image : googleResponse.data.picture,
                isEmailVerified : googleResponse.data.email_verified
            });

            await newUser.save();

            const payload = {
                email : googleResponse.data.email,
                firstName : googleResponse.data.given_name,
                lastName : googleResponse.data.family_name,
                isAdmin : false,
                isBlocked : false,
                isEmailVerified : googleResponse.data.email_verified,
                image : googleResponse.data.picture
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET_KEY ,{ expiresIn : "48h" });//create token
            res.json({
                token : token,
                isAdmin : false
            });
        }
    }catch(error){
        console.log(error);
        res.status(500).json({
            message : "Google authentication failed. Please try again.",
            error : error.message
        });
    }
}

export function isAdmin(req,res){
    if(req.user == null){
        return false;
    }
    
    if(req.user.isAdmin){
        return true;
    }else{
        return false;
    }
}

export function getUserDetails(req,res){
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized"
        });
    }else{
        res.status(200).json(req.user);
    }
}

export async function updateUserDetails(req,res){
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized"
        });
    }

    try{
        await User.findOneAndUpdate({ email : req.user.email },
            { 
                firstName : req.body.firstName,
                lastName : req.body.lastName,
                image : req.body.image
            }
        );

        const updatedUser = await User.findOne({ email : req.user.email});
        const payload = {
                        email : updatedUser.email,
                        firstName : updatedUser.firstName,
                        lastName : updatedUser.lastName,
                        isAdmin : updatedUser.isAdmin,
                        isBlocked : updatedUser.isBlocked,
                        isEmailVerified : updatedUser.isEmailVerified,
                        image : updatedUser.image
                    }

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn : "48h" });

        res.json({
            token : token,
            message : "User update successfully"
        });
    }catch(error){
        res.status(500).json({
            message : "Error updating User",
            error : error.message
        });
    }

    
}

export async function updatePassword(req,res){
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized"
        });
        return;
    }

    try{
        const previousPasswordHash = await User.findOne({ email : req.user.email }).select("password");

        const isPasswordCorrect = bcrypt.compareSync(req.body.currentPassword, previousPasswordHash.password);

        if(!isPasswordCorrect){
            res.status(400).json({
                message : "Current password is incorrect."
            });
            return;
        }else{
            if(req.body.newPassword != req.body.confirmPassword){
                res.status(400).json({
                    message : "New password and confirm password do not match."
                });
                return;
            }
        }


        const hashPassword = bcrypt.hashSync( req.body.newPassword , 10);
        await User.updateOne({ email : req.user.email },
            {
                password : hashPassword
            }
        );

        res.json({
            message : "User password update successfully"
        });
    }catch(error){
        res.status(500).json({
            message : "Error updating User Password",
            error : error.message
        });
    }

}

export async function sendOTP(req,res){
    const userEmail = req.body.email;
    try{
        const user = await User.findOne({ email : userEmail });

        if(!user){
            res.status(404).json({
                message : "User not found with this email."
            });
            return;
        }
        // delete OTP for the email if exists
        await OTP.deleteOne({email : userEmail });
        //OTP genarate and save it in database
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newOTP = new OTP({
            email : userEmail,
            otp : otpCode
        });
        await newOTP.save();
        // send OTP to user email using nodemailer lib
        // create transporter object with Gmail SMTP configuration(This is need for sending email using nodemailer lib connecting with Gmail SMTP server)
        const transporter = nodemailer.createTransport({
            service : "gmail",
            host : "smtp.gmail.com",
            port : 587,
            secure : false,
            auth : {
                user : process.env.GMAIL_USER,
                pass : process.env.GMAIL_APP_PASSWORD
            }
        });

        const message = {
            from : process.env.GMAIL_USER,
            to : userEmail,
            subject : "Password Reset OTP - I-Computer",
            text : `Your OTP for password reset is ${otpCode}. It is valid for 10 minutes.`
        };

        await transporter.sendMail(message, (err, info)=>{
            if(err){
                res.status(500).json({
                    message : "Error sending OTP email. Please try again.",
                    error : err.message
                });
            }else{
                res.json({
                    message : "OTP sent to email successfully."
                });
            }
        });
    }catch(error){
        res.status(500).json({
            message : "Error sending OTP",
            error : error.message
        });
    }
}

export async function verifyOTPAndResetPassword(req,res){
    const otp = req.body.otp;
    const email = req.body.email;
    const newPassword = req.body.newPassword;

    try{
        const otpRecord = await OTP.findOne({ email : email });

        if(!otpRecord){
            res.status(400).json({
                message : "Invalid OTP."
            });
            return;
        }

        if(otpRecord.otp !== otp){
            res.status(400).json({
                message : "Invalid OTP."
            });
            return;
        }

        const otpAge = (Date.now() - otpRecord.createdTime.getTime()) / (1000 * 60); // age in minutes

        if(otpAge > 10){ // OTP valid for 10 minutes
            await OTP.deleteOne({ email : email });
            res.status(400).json({
                message : "OTP has expired."
            });
            return;
        }

        const hashPassword = bcrypt.hashSync(newPassword, 10);
        await User.findOneAndUpdate({ email : email }, { password : hashPassword });
        await   OTP.deleteOne({ email : email });

        res.json({
            message : "Password reset successfully."
        });

    }catch(error){  
        res.status(500).json({
            message : "Error resetting password",
            error : error.message
        });
    }
}
