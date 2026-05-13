import { Schema, model, models } from "mongoose";

type OrderCustomer = {
    name: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
};

type OrderProduct = {
    productId: string;
    title: string;
    brand: string;
    image: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    size: string;
    quantity: number;
    seller?: string;
    stock?: number;
};

type OrderDocument = {
    customer: OrderCustomer;
    products: OrderProduct[];
    totalMRP: number;
    totalDiscount: number;
    finalAmount: number;
    paymentMethod: string;
    orderDate: Date;
    status: string;
};

const OrderCustomerSchema = new Schema<OrderCustomer>(
    {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    { _id: false }
);

const OrderProductSchema = new Schema<OrderProduct>(
    {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        brand: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        discount: { type: Number },
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        seller: { type: String },
        stock: { type: Number },
    },
    { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
    {
        customer: {
            type: OrderCustomerSchema,
            required: true,
        },
        products: {
            type: [OrderProductSchema],
            required: true,
            default: [],
        },
        totalMRP: {
            type: Number,
            required: true,
        },
        totalDiscount: {
            type: Number,
            required: true,
        },
        finalAmount: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
            default: "COD",
        },
        orderDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            required: true,
            default: "placed",
        },
    },
    { timestamps: true }
);

const Order = models.Order || model<OrderDocument>("Order", OrderSchema);

export default Order;
