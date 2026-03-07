"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useParams } from "next/navigation";
import Slider from "react-slick";

type ProductDetails = {
    _id?: string;
    brand: string;
    title: string;
    heading?: string;
    galleryImages?: string[];
    sizes?: string[];
    desc?: string;
    details?: Record<string, unknown>;
    rating: number;
    Seller?: string;
    seller?: string;
    reviews: number;
    stock: number;
    price: number;
    originalPrice?: number;
    discount?: number;
};

type Category = {
    _id: string;
    mainCategory: string;
    subCategories: {
        name: string;
        subSubCategories?: string[];
    }[];
};

const normalizeParam = (param: string | string[] | undefined) =>
    Array.isArray(param) ? param[0] : param ?? "";

const toSlug = (value: string) => value.toLowerCase().trim().replace(/\s+/g, "-");

const extractObjectId = (value: string) => {
    const parts = value.split("-");
    const candidate = parts[parts.length - 1] ?? "";
    return /^[a-fA-F0-9]{24}$/.test(candidate) ? candidate : "";
};

function Page() {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
    };

    const params = useParams();
    const slug = normalizeParam(params?.slug);
    const productSlug = normalizeParam(params?.productSlug);
    const productDetailsSlug = normalizeParam(params?.productDetailsSlug);

    const [product, setProduct] = React.useState<ProductDetails | null>(null);
    const [selectedSize, setSelectedSize] = React.useState<string>("");
    const [loading, setLoading] = React.useState(true);
    const [isRouteValid, setIsRouteValid] = React.useState(false);

    React.useEffect(() => {
        const fetchProduct = async () => {
            try {
                const categoriesResponse = await fetch("/api/categories");

                const categories: Category[] = await categoriesResponse.json();
                const matchedCategory = categories.find(
                    (category) =>
                        toSlug(category.mainCategory) === "men" &&
                        category.subCategories.some((subCategory) => toSlug(subCategory.name) === slug)
                );
                const matchedSubCategory = matchedCategory?.subCategories.find(
                    (subCategory) => toSlug(subCategory.name) === slug
                );
                const matchedSubSubCategory = matchedSubCategory?.subSubCategories?.find(
                    (subSubCategory) => toSlug(subSubCategory) === productSlug
                );
                const isValid = Boolean(matchedCategory && matchedSubCategory && matchedSubSubCategory);

                setIsRouteValid(isValid);

                if (!isValid) {
                    setProduct(null);
                    return;
                }

                const query = new URLSearchParams({
                    categoryId: matchedCategory!._id,
                    subCategory: matchedSubCategory!.name,
                    subSubCategory: matchedSubSubCategory!,
                });
                const productsResponse = await fetch(`/api/product-upload?${query.toString()}`);
                const data: ProductDetails[] = await productsResponse.json();

                const byId = extractObjectId(productDetailsSlug);

                const found = data.find((item) => {
                    if (byId && item._id === byId) {
                        return true;
                    }
                    const currentSlug = item.title ? toSlug(item.title) : "";
                    return currentSlug === productDetailsSlug;
                });

                setProduct(found ?? null);
                if (found?.sizes?.length) {
                    setSelectedSize(found.sizes[0]);
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
                setProduct(null);
                setIsRouteValid(false);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug, productSlug, productDetailsSlug]);

    if (loading) {
        return <div className="pad100 container">Loading product details...</div>;
    }

    if (!isRouteValid) {
        return (
            <div className="pad100 container">
                <h2>Page not found</h2>
                <Link href="/">Back to home</Link>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pad100 container">
                <h2>Product not found</h2>
                <Link href={`/men/${slug}/${productSlug}`}>Back to products</Link>
            </div>
        );
    }

    const imageIds = product.galleryImages?.length
        ? product.galleryImages
        : ["fallback-image"];
    const sellerName = product.seller ?? product.Seller ?? "Not available";
    const detailsEntries = Object.entries(product.details ?? {});
    const hasPriceDrop =
        typeof product.originalPrice === "number" && product.originalPrice > product.price;

    return (
        <div className="pad100 productPageSection">
            <div className="container">
                <div className="detailspageSection">
                    <div className="sliderSection">
                        <Slider {...settings}>
                            {imageIds.map((imageId, index) => (
                                <div key={`${imageId}-${index}`}>
                                    <div className="sliderImg">
                                        <Image
                                            src={
                                                imageId === "fallback-image"
                                                    ? "/images/tshirt/tshirt1.webp"
                                                    : `/api/uploads/${imageId}`
                                            }
                                            alt={product.title}
                                            width={500}
                                            height={500}
                                        />
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>

                    <div className="pageDetails">
                        <div className="productDetailsPage">
                            <div className="productInfo">
                                <h2 className="brand">{product.brand}</h2>
                                <p className="title">{product.title}</p>

                                <div className="ratingBox">
                                    <span>{product.rating} *</span>
                                    <span className="divider"></span>
                                    <span className="ratings">{product.reviews} Ratings</span>
                                </div>

                                <hr />

                                <div className="priceBox">
                                    <span className="price">Rs. {product.price}</span>
                                    {hasPriceDrop ? (
                                        <span className="mrp">Rs. {product.originalPrice}</span>
                                    ) : null}
                                    {product.discount ? (
                                        <span className="discount">({product.discount}% OFF)</span>
                                    ) : null}
                                </div>

                                <p className="tax">inclusive of all taxes</p>

                                <div className="sizeHeader">
                                    <h5>SELECT SIZE</h5>
                                    <span className="sizeChart">SIZE CHART</span>
                                </div>

                                <div className="sizes">
                                    {(product.sizes ?? []).map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            className={selectedSize === size ? "active" : ""}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                            <br />
                                            <span>Rs. {product.price}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="actions">
                                    <button className="addToBag">ADD TO BAG</button>
                                    <button className="wishlist">WISHLIST</button>
                                </div>

                                <hr />

                                <div className="seller">
                                    <p>
                                        Rs. {product.price}{" "}
                                        {hasPriceDrop ? (
                                            <span className="strike">Rs. {product.originalPrice}</span>
                                        ) : null}{" "}
                                        {product.discount ? (
                                            <span className="discount">({product.discount}% OFF)</span>
                                        ) : null}
                                    </p>
                                    <p>
                                        Seller: <span className="sellerName">{sellerName}</span>
                                    </p>
                                </div>

                                <div className="delivery">
                                    <h4>DELIVERY OPTIONS</h4>
                                    <div className="pincodeBox">
                                        <input type="text" placeholder="Enter pincode" />
                                        <button type="button">Check</button>
                                    </div>
                                    <p className="note">
                                        Please enter PIN code to check delivery time and payment availability
                                    </p>
                                </div>
                            </div>

                            <hr />

                            <div className="productDetailsSection">
                                <div className="productDetailsContainer">
                                    <h3 className="heading">PRODUCT DETAILS</h3>

                                    <p className="description">
                                        {product.desc || product.heading || "No description available."}
                                    </p>

                                    {detailsEntries.length > 0 ? (
                                        <div className="block">
                                            <h4>Specifications</h4>
                                            <div className="specGrid">
                                                {detailsEntries.map(([key, value]) => (
                                                    <div className="specItem" key={key}>
                                                        <span>{key}</span>
                                                        <p>{String(value)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="block">
                                        <h4>Stock</h4>
                                        <p>{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
