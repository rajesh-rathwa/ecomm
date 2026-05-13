import { connectDB } from "@/app/_lib/utills/mongoose";
import ProductModel, { Product } from "@/app/models/Product";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import createProduct from "../../_lib/utills/product-utills";
import { uploadFilesToGridFS, UploadedFile } from "@/app/_lib/utills/gridfs";

const ALLOWED_SIZES = [
    "XS", "S", "M", "L", "XL", "XXL",
    "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12",
] as const;
type AllowedSize = (typeof ALLOWED_SIZES)[number];

export async function POST(req: Request) {
    try {
        const productDetails = await req.formData();

        const prdctTitle = String(productDetails.get("title") ?? "");
        const prdctBrand = String(productDetails.get("brand") ?? "");
        const filterCategories = String(productDetails.get("filterCategories") ?? "");
        const prdctCategory = String(productDetails.get("category") ?? "");
        const prdctSubCategory = String(productDetails.get("subCategory") ?? "");
        const prdctSubSubCategory = String(productDetails.get("subSubCategory") ?? "");
        const prdctDesc = String(productDetails.get("description") ?? productDetails.get("desc") ?? "");
        const prdctSeller = String(productDetails.get("seller") ?? "");

        const prdctOriginalPrice = Number(productDetails.get("originalPrice"));
        const prdctPrice = Number(productDetails.get("price"));
        const prdctDiscount = Number(productDetails.get("discount"));
        const prdctRating = Number(productDetails.get("rating"));
        const prdctReviews = Number(productDetails.get("reviews"));
        const prdctStock = Number(productDetails.get("stock"));

        const productSizes = productDetails
            .getAll("sizes")
            .map(String)
            .filter((size): size is AllowedSize =>
                (ALLOWED_SIZES as readonly string[]).includes(size)
            );

        if (!prdctTitle || !prdctBrand || !filterCategories || !prdctCategory || !prdctSubCategory || !prdctSubSubCategory) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        const imageFiles = productDetails.getAll("prdctImages").filter((x): x is File => x instanceof File);

        await connectDB();

        const uploadedFiles: UploadedFile[] = await uploadFilesToGridFS(imageFiles, {
            bucketName: "uploads",
            folder: "products",
        });

        const galleryImageIds = uploadedFiles.map((f) => f.fileId);

        const product: Product = {
            title: prdctTitle,
            brand: prdctBrand,
            filterCategories: filterCategories,
            category: prdctCategory,
            subCategory: prdctSubCategory,
            subSubCategory: prdctSubSubCategory,
            galleryImages: galleryImageIds,
            originalPrice: prdctOriginalPrice,
            price: prdctPrice,
            rating: prdctRating,
            reviews: prdctReviews,
            sizes: productSizes,
            stock: prdctStock,
            desc: prdctDesc,
            details: {},
            discount: prdctDiscount,
            related_products: [],
            Seller: prdctSeller,
        };

        const created = await createProduct(ProductModel, product);

        return NextResponse.json({
            success: true,
            product: created,
            files: uploadedFiles,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload product";
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");
    const subCategory = searchParams.get("subCategory");
    const subSubCategory = searchParams.get("subSubCategory");

    if (productId) {
        if (!Types.ObjectId.isValid(productId)) {
            return NextResponse.json(null, { status: 400 });
        }

        const product = await ProductModel.findById(productId);
        return NextResponse.json(product);
    }

    const query: Record<string, unknown> = {};

    if (categoryId) {
        if (!Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json([]);
        }
        query.category = categoryId;
    }
    if (subCategory) {
        query.subCategory = subCategory;
    }
    if (subSubCategory) {
        query.subSubCategory = subSubCategory;
    }

    const products = await ProductModel.find(query);
    return NextResponse.json(products);
}
