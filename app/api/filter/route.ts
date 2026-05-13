import { NextResponse } from "next/server";
import {connectDB} from "@/app/_lib/utills/mongoose";
import FilterModel from "@/app/models/FilterModel";

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();

        const {
            category,
            subCategory = null,
            subSubCategory = null,
            categories = [],
            brands = []
        } = body;

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category is required"
                },
                { status: 400 }
            );
        }



        const filter = await FilterModel.findOneAndUpdate(
            {
                category,
                subCategory,
                subSubCategory
            },
            {
                category,
                subCategory,
                subSubCategory,
                categories,
                brands
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return NextResponse.json(
            {
                success: true,
                message: "Filter saved successfully",
                data: filter
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Filter POST Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong"
            },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } =
            new URL(req.url);

        const category =
            searchParams.get(
                "category"
            );

        const subCategory =
            searchParams.get(
                "subCategory"
            );

        const subSubCategory =
            searchParams.get(
                "subSubCategory"
            );

        const data =
            await FilterModel.findOne({
                category,
                subCategory,
                subSubCategory,
            }).select(
                "brands categories"
            );

        return NextResponse.json({
            success: true,
            brands:
                data?.brands || [],
            categories:
                data?.categories ||
                [],
        });
    } catch {
        return NextResponse.json(
            {
                success: false,
                brands: [],
                categories: [],
            },
            { status: 500 }
        );
    }
}
