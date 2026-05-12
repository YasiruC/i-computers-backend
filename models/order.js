import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId : {
        type : String,
        require : true,
        unique : true //ORD000001
    },
    email : {
        type : String,
        require : true
    },
    firstName : {
        type : String,
        require : true
    },
    lastName : {
        type : String,
        require : true
    },
    addressLineOne : {
        type : String,
        require : true
    },
    addressLineTwo : {
        type : String
    },
    city : {
        type : String,
        require : true
    },
    state : {
        type : String,
        require : true
    },
    postalCode : {
        type : String,
        require : true
    },
    orderState : {
        type : String,
        require : true,
        default : "Pending" //Shiped Completed Cancelled
    },
    date : {
        type : Date,
        require : true,
        default : Date.now
    },
    phone : {
        type : String,
        require : true,
    },
    total : {
        type : String,
        require : true
    },
    notes : {
        type : String
    },
    items : [
        {
            product : {
                productId : {
                    type : String,
                    require : true
                },
                name : {
                    type : String,
                    require : true
                },
                price : {
                    type : Number,
                    require : true
                },
                labelPrice : {
                    type : Number
                },
                image : {
                    type : String
                }
            },
            quantity : {
                type : Number,
                require : true
            }
        }
    ]
});

const Order = mongoose.model("Order", orderSchema);

export default Order;