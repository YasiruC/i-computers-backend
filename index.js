import express from "express";
import dns from 'dns';// dns lib eka import 
import mongoose from "mongoose";
import userRouter from "./routers/userRouter.js";
import authenticateUser from "./middlewares/authentication.js";
import productRouter from "./routers/productRouter.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']);//IP address search kirima google dns lookup eka magin kirimata
const app = express();

const mongodbURL = process.env.MONGO_URI;

mongoose.connect(mongodbURL).then(()=>{
    console.log("Database connect");
}).catch(
    (err) => {
        console.log("Connection failed");
        console.log(err);
    }
);

app.use(cors({ origin : "http://localhost:5173"}));
app.use(express.json());
app.use(authenticateUser);

app.use("/api/users",userRouter);
app.use("/api/products",productRouter);

app.listen(3000,
    ()=>{
        console.log("Server is running on port 3000");
    }
)