import { Schema, model, models } from "mongoose";
import type { WishlistItem } from "@/app/_lib/types";

type WishlistDocument = {
    sessionId: string;
    items: WishlistItem[];
};

const WishlistItemSchema = new Schema<WishlistItem>(
    {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        brand: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        discount: { type: Number },
        size: { type: String },
        availableSizes: { type: [String], default: [] },
        seller: { type: String },
        stock: { type: Number },
        href: { type: String, required: true },
    },
    { _id: false }
);

const WishlistSchema = new Schema<WishlistDocument>(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        items: {
            type: [WishlistItemSchema],
            default: [],
        },
    },
    { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && models.Wishlist) {
    delete models.Wishlist;
}

const Wishlist = models.Wishlist || model<WishlistDocument>("Wishlist", WishlistSchema);

export default Wishlist;
