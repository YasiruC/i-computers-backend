import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
                message: "Student Save Unsuccessful!",
                error: err.message
            });
        });
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
