import { Product } from "@/app/models/Product";
import mongoose from "mongoose";

async function crateProduct(productModel: mongoose.Model<Product>, productDetails: Product) {
    const model = await productModel.create(productDetails);
    await model.save();
    return model;
}
export default crateProduct;
