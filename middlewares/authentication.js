import jwt from "jsonwebtoken";

export default function authenticateUser(req, res, next){
    const header = req.header("Authorization");

    if(header != null){
        const token = header.replace("Bearer ","");//use token

        jwt.verify(token,"I-ComputerMern", 
            (error,decoded)=>{
                if(decoded == null){
                    res.json({
                        message : "Invalid token please login again"
                    });
                }else{
                    req.user = decoded;
                    next();
                }
            }
        );

    }else{
        next();
    }
}