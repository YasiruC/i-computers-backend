import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createProduct(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message : "Access denied. Admins only."
        });
        return;
    }

    try{
        const existingProduct = await Product.findOne({
            productId : req.body.productId
        });
        
        if(existingProduct != null){
            res.status(400).json({
                message : "Product with this productId already exists."
            });
        }

        const newProduct = new Product({
            productId : req.body.productId,
            name : req.body.name,
            altNames : req.body.altNames,
            price : req.body.price,
            labelPrice : req.body.labelPrice,
            description : req.body.description,
            images : req.body.images,
            brand : req.body.brand,
            model : req.body.model,
            category : req.body.category,
            stock : req.body.stock
        });

        await newProduct.save();

        res.status(201).json({
            message : "Product creating successful."
        });

    }catch(error){
        res.status(500).json({
            message : "Error creating product",
            error : error.message
        });
    }
}

export async function getAllProducts(req,res){
    try{
        if(isAdmin(req,res)){
            const products = await Product.find();
            res.json(products);
        }else{
            const products = await Product.find({ isAvailable : true });
            res.json(products);
        }
    }catch(error){
        res.status(500).json({
            message : "Error fetching products",
            error : error.message
        });
    }
}

export async function deleteProduct(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message : "Access denied. Admins only."
        });
        return;
    }

    try{
        await Product.deleteOne({ productId : req.params.productId});

        res.json({
            message : "Product delete successful"
        });
    }catch(error){
        res.status(500).json({
            message : "Error deleting product",
            error : error.message
        });
    }
}

export async function updateProduct(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message : "Access denied. Admins only."
        });
        return;
    }

    try{
        await Product.updateOne({
            productId : req.params.productId
        },{
            name : req.body.name,
            altNames : req.body.altNames,
            price : req.body.price,
            labelPrice : req.body.labelPrice,
            description : req.body.description,
            images : req.body.images,
            brand : req.body.brand,
            model : req.body.model,
            category : req.body.category,
            stock : req.body.stock,
            isAvailable : req.body.isAvailable
        });

        res.json({
            message : "Product update successful"
        });
    }catch(error){
        res.status(500).json({
            message : "Error updating product",
            error : error.message
        });
    }
}

export async function getProductById(req,res){
    try{
        const product = await Product.findOne({ productId : req.params.productId});

        if(product == null){
            res.status(404).json({
                message : "Product not found."
            });
        }else{
            if(product.isAvailable){
                res.json(product);
            }else{
                if(isAdmin(req)){
                    res.json(product);
                }else{
                    res.json({
                        message : "Product is not availble."
                    });
                }
            }
        }
    }catch(error){
        res.status(500).json({
            message : "Error fetching product",
            error : error.message
        });
    }
}