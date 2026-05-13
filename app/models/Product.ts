import { Schema, Types, models, model } from "mongoose";

type clothSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
type shoeSize = "6" | "6.5" | "7" | "7.5" | "8" | "8.5" | "9" | "9.5" | "10" | "10.5" | "11" | "11.5" | "12";
type ProductSize = clothSize | shoeSize;

export type Product = {
    brand: string;
    filterCategories: string;
    title: string;
    heading?: string;
    galleryImages: string[];
    sizes: ProductSize[];
    desc?: string;
    details?: Record<string, unknown>;
    // gender-target -> male 
    rating: number;
    Seller?: string;
    reviews: number;
    stock: number;
    price: number;
    originalPrice: number;
    discount?: number;
    category: Types.ObjectId | string;
    subCategory?: string;
    subSubCategory?: string;
    related_products?: Array<Types.ObjectId | string>;
};

const ProductSchema = new Schema<Product>(
    {
        brand: {
            type: String,
            required: [true, "Brand is required"],
            trim: true,
        },
        filterCategories :{
            type: String,
            required: [true, "Filter categories are required"],
        },

        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },

        heading: {
            type: String,
            trim: true,
        },

        galleryImages: {
            required: [true, "Gallery images are required"],
            type: [String],
            default: [],
        },

        sizes: {
            type: [String],
            required: [true, "Sizes are required"],
            enum: ["XS", "S", "M", "L", "XL", "XXL", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
        },
        desc: {
            type: String,
        },
        details: {
            type: Schema.Types.Mixed,
            default: {},
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        Seller: {
            type: String,
        },

        reviews: {
            type: Number,
            default: 0,
        },

        stock: {
            type: Number,
            required: true,
            default: 0,
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
        },

        originalPrice: {
            type: Number,
        },

        discount: {
            type: Number,
        },

        category: {
            type: Schema.Types.ObjectId,
            ref: "Categories",
            required: true
        },
        subCategory: {
            type: String,
            required: true,
            trim: true,
        },
        subSubCategory: {
            type: String,
            required: true,
            trim: true,
        },

        related_products: [{
            type: Schema.Types.ObjectId,
            ref: "Product"
        }]
    },
    {
        timestamps: true,
    }
);

if (process.env.NODE_ENV !== "production" && models.Product) {
    delete models.Product;
}

const ProductModel = models.Product || model<Product>("Product", ProductSchema);

export default ProductModel;
