import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

                    const token = jwt.sign(payload,"I-ComputerMern",{ expiresIn : "48h" });//create token
                    res.json({
                        token : token
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