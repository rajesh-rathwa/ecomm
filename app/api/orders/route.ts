import { NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/utills/mongoose";
import Order from "@/app/models/Order";

type OrderRequest = {
    customer?: {
        name?: string;
        mobile?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    products?: Array<{
        productId?: string;
        title?: string;
        brand?: string;
        image?: string;
        price?: number;
        size?: string;
        quantity?: number;
    }>;
    totalMRP?: number;
    totalDiscount?: number;
    finalAmount?: number;
    paymentMethod?: string;
    orderDate?: string;
};

export async function POST(
    req: Request
) {

    try {
        await connectDB();

        const body =
            await req.json() as OrderRequest;

        const customer = body.customer;
        const products = body.products ?? [];

        if (
            !customer?.name ||
            !customer.mobile ||
            !customer.address ||
            !customer.city ||
            !customer.state ||
            !customer.pincode
        ) {
            return NextResponse.json({
                success: false,
                message: "Customer details are required",
            }, { status: 400 });
        }

        if (products.length === 0) {
            return NextResponse.json({
                success: false,
                message: "At least one product is required",
            }, { status: 400 });
        }

        const createdOrder = await Order.create({
            customer,
            products,
            totalMRP: body.totalMRP ?? 0,
            totalDiscount: body.totalDiscount ?? 0,
            finalAmount: body.finalAmount ?? 0,
            paymentMethod: body.paymentMethod ?? "COD",
            orderDate: body.orderDate ? new Date(body.orderDate) : new Date(),
            status: "placed",
        });

        return NextResponse.json({
            success: true,
            orderId: createdOrder._id.toString(),
        });

    } catch (error) {
        console.error("Order create error:", error);

        return NextResponse.json({
            success: false,
            message: "Failed to place order",
        }, { status: 500 });

    }
}
