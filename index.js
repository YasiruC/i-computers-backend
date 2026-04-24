import express from "express";
import dns from 'dns';// dns lib eka import 
import mongoose from "mongoose";
import userRouter from "./routers/userRouter.js";
import studentRouter from "./routers/studentRouter.js";
import authenticateUser from "./middlewares/authentication.js";
import productRouter from "./routers/productRouter.js";

dns.setServers(['8.8.8.8', '8.8.4.4']);//IP address search kirima google dns lookup eka magin kirimata
const app = express();

const mongodbURL = "mongodb+srv://admin:123@cluster0.tpzlbds.mongodb.net/i-computer?appName=Cluster0";

mongoose.connect(mongodbURL).then(()=>{
    console.log("Database connect");
}).catch(
    (err) => {
        console.log("Connection failed");
        console.log(err);
    }
);

app.use(express.json());

app.use(authenticateUser);


app.use("/student",studentRouter);
app.use("/users",userRouter);
app.use("/product",productRouter);

app.listen(3001,
    ()=>{
        console.log("Server is running on port 3001");
    }
)