import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req,res){
    const user = req.user;

    if(user == null){
        res.status(401).json({
            message : "You need to be logged in to place an order"
        });
        return;
    }

    // initialize order details
    const orderData = {
        orderId : "ORD00000001",
        email : user.email,
        firstName : user.firstName,
        lastName : user.lastName,
        addressLineOne : req.body.addressLineOne,
        addressLineTwo : req.body.addressLineTwo,
        city : req.body.city,
        state : req.body.state,
        postalCode : req.body.postalCode,
        phone : req.body.phone,
        total : 0,
        items : []
    }

    //if existed firstName or lastName in request body, set it orderData
    if(req.body.firstName != null && req.body.firstName != ""){
        orderData.firstName = req.body.firstName;
    }
    if(req.body.lastName != null && req.body.lastName != ""){
        orderData.lastName = req.body.lastName;
    }

    try {
        //genarete Order Id
        const lastOrder = await Order.findOne().sort({ data : -1 });

        if(lastOrder.orderId != null){
            const newOrderId = parseInt(lastOrder.orderId.replace("ORD","")) + 1; //if lastOrder.orderId is "ORD000000039" ,now newOrderId is 40
            const newOrderIdString = newOrderId.padStart(8, "0"); //"00000040"
            orderData.orderId = "ORD0" + newOrderIdString; //"ORD00000040"
        }

        //check items array, product is valied and set orderData 
        for(let i = 0;i < req.body.items.length;i++){
            const product = await Product.findOne({ productId : req.body.items[i].productId });

            // item have productId and quantity only. Product details get database

            if(product == null || !product.isAvailable || product.stock <= 0){
                res.status(400).json({
                    message : "Product with productId " + req.body.items[i].productId + "not found. Please place your order without this product."
                });
                return;
            }else{
                orderData.items.push(
                    {
                        product : {
                            productId : product.productId,
                            name : product.name,
                            price : product.price,
                            labelPrice : product.labelPrice,
                            image : product.images[0]
                        },
                        quantity : req.body.items[i].quantity
                    }
                );

                orderData.total += product.price * req.body.items[i].quantity;

                //calculate new stock of product and update product
                const newQty = product.stock - req.body.items[i].quantity;

                if( newQty > 0){
                    await Product.updateOne(
                        { productId : product.productId },
                        { stock : newQty }
                    );
                }else{
                    await Product.updateOne(
                        { productId : product.productId },
                        { stock : 0 }
                    );
                }

                
            }
        }//Now all properties of orderData have been set

        //save order database
        const newOrder = new Order(orderData);
        await newOrder.save();

        res.status(201).json({
            message : "Order placed successfully"
        });

    } catch (error) {
        res.status(500).json({
            message : "Error creating order"
        });
    }
}