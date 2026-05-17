import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email : {
        type : String,
        require : true,
        unique : true
    },
    otp : {
        type : String,
        require : true
    },
    createdTime : {
        type : Date,
        require : true, 
        default : Date.now,
        expires : 600 // OTP will expire after 10 minutes (600 seconds)
    }
});

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;