"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import Slider from "react-slick";
import type { CartItem, CartResponse, WishlistItem, WishlistResponse } from "@/app/_lib/types";

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
category?: string;
subCategory?: string;
subSubCategory?: string;
};

type Category = {
    _id: string;
    mainCategory: string;
    subCategories: {
        name: string;
        subSubCategories?: string[];
    }[];
};

// This function handles route param safely.
// If param comes in array, it takes first value.
const normalizeParam = (param: string | string[] | undefined) =>
    Array.isArray(param) ? param[0] : param ?? "";

// This function changes text into URL-friendly format.
const toSlug = (value: string) => value.toLowerCase().trim().replace(/\s+/g, "-");

// This function gets MongoDB ObjectId from slug text.
const extractObjectId = (value: string) => {
    const parts = value.split("-");
    const candidate = parts[parts.length - 1] ?? "";
    return /^[a-fA-F0-9]{24}$/.test(candidate) ? candidate : "";
};

// This page component shows single product full details.
function Page() {
    // These settings are used for product image slider.
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
    };

    const router = useRouter();
    const params = useParams();
    const slug = normalizeParam(params?.slug);
    const productSlug = normalizeParam(params?.productSlug);
    const productDetailsSlug = normalizeParam(params?.productDetailsSlug);

    const [product, setProduct] = React.useState<ProductDetails | null>(null);
    const [selectedSize, setSelectedSize] = React.useState<string>("");
    const [loading, setLoading] = React.useState(true);
    const [isRouteValid, setIsRouteValid] = React.useState(false);
    const [isInWishlist, setIsInWishlist] = React.useState(false);
    const [wishlistLoading, setWishlistLoading] = React.useState(false);

// This function adds selected product into cart.
const handleAddToCart = async () => {

    if (!product) return;
    if (!product._id) {
        alert("Product ID is missing");
        return;
    }

    if (!selectedSize) {
        alert("Please select size");
        return;
    }

    const cartItem: CartItem = {

        productId: product._id,

        title: product.title,

        brand: product.brand,

        image:
            product.galleryImages?.length
                ? `/api/uploads/${product.galleryImages[0]}`
                : "/images/tshirt/tshirt1.webp",

        price: product.price,

        originalPrice: product.originalPrice,

        discount: product.discount,

        size: selectedSize,

        quantity: 1,

        seller: sellerName,

        stock: product.stock,
    };

    try {
        const response = await fetch("/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ item: cartItem }),
        });
        const data = (await response.json()) as CartResponse;

        if (!response.ok || !data.success) {
            alert("Failed to add product to bag");
            return;
        }

        window.dispatchEvent(
            new Event("cartUpdated")
        );

        alert("Product added to bag");

        router.push("/checkout/cart");
    } catch (error) {
        console.error("Add to cart error:", error);
        alert("Failed to add product to bag");
    }
};

// This function adds product to wishlist or removes it from wishlist.
const handleWishlistToggle = async () => {
    if (!product?._id) {
        alert("Product ID is missing");
        return;
    }

    const wishlistItem: WishlistItem = {
        productId: product._id,
        title: product.title,
        brand: product.brand,
        image: product.galleryImages?.length
            ? `/api/uploads/${product.galleryImages[0]}`
            : "/images/tshirt/tshirt1.webp",
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        size: selectedSize,
        availableSizes: product.sizes ?? [],
        seller: sellerName,
        stock: product.stock,
        href: `/men/${slug}/${productSlug}/${productDetailsSlug}`,
    };

    try {
        setWishlistLoading(true);

        const response = await fetch("/api/wishlist", {
            method: isInWishlist ? "PATCH" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                isInWishlist
                    ? {
                        action: "remove",
                        productId: product._id,
                    }
                    : {
                        item: wishlistItem,
                    }
            ),
        });
        const data = (await response.json()) as WishlistResponse;

        if (!response.ok || !data.success) {
            alert("Failed to update wishlist");
            return;
        }

        const nextState = data.items.some(
            (item) => item.productId === product._id
        );

        setIsInWishlist(nextState);
        window.dispatchEvent(new Event("wishlistUpdated"));
        alert(nextState ? "Product added to wishlist" : "Product removed from wishlist");
    } catch (error) {
        console.error("Wishlist update error:", error);
        alert("Failed to update wishlist");
    } finally {
        setWishlistLoading(false);
    }
};

    React.useEffect(() => {
        // This function gets product details based on URL and also checks wishlist status.
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

                if (found?._id) {
                    const wishlistResponse = await fetch("/api/wishlist", {
                        cache: "no-store",
                    });
                    const wishlistData = (await wishlistResponse.json()) as WishlistResponse;

                    if (wishlistResponse.ok && wishlistData.success) {
                        setIsInWishlist(
                            wishlistData.items.some(
                                (wishlistItem) => wishlistItem.productId === found._id
                            )
                        );
                    }
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

    // While data is loading, loading message will show.
    if (loading) {
        return <div className="pad100 container">Loading product details...</div>;
    }

    // If URL category or product path is wrong, not found page will show.
    if (!isRouteValid) {
        return (
            <div className="pad100 container">
                <h2>Page not found</h2>
                <Link href="/">Back to home</Link>
            </div>
        );
    }

    // If route is correct but product data is missing, product not found will show.
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
                                    <button className="addToBag"  onClick={handleAddToCart}>ADD TO BAG</button>
                                    <button className="wishlist" onClick={handleWishlistToggle} disabled={wishlistLoading}>
                                        {wishlistLoading ? "UPDATING..." : isInWishlist ? "WISHLISTED" : "WISHLIST"}
                                    </button>
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

                                {/* <div className="delivery">
                                    <h4>DELIVERY OPTIONS</h4>
                                    <div className="pincodeBox">
                                        <input type="text" placeholder="Enter pincode" />
                                        <button type="button">Check</button>
                                    </div>
                                    <p className="note">
                                        Please enter PIN code to check delivery time and payment availability
                                    </p>
                                </div> */}
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
