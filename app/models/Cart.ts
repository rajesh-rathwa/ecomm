import { Schema, model, models } from "mongoose";
import type { CartItem } from "@/app/_lib/types";

type CartDocument = {
    sessionId: string;
    items: CartItem[];
};

const CartItemSchema = new Schema<CartItem>(
    {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        brand: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        discount: { type: Number },
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        seller: { type: String },
        stock: { type: Number },
    },
    { _id: false }
);

const CartSchema = new Schema<CartDocument>(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        items: {
            type: [CartItemSchema],
            default: [],
        },
    },
    { timestamps: true }
);

const Cart = models.Cart || model<CartDocument>("Cart", CartSchema);

export default Cart;
