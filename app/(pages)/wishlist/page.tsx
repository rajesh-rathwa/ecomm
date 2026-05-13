"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CartItem, CartResponse, WishlistItem, WishlistResponse } from "@/app/_lib/types";

function Page() {
    const router = useRouter();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadWishlist = React.useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch("/api/wishlist", {
                cache: "no-store",
            });
            const data = (await response.json()) as WishlistResponse;

            if (!response.ok || !data.success) {
                setWishlistItems([]);
                return;
            }

            const enrichedItems = await Promise.all(
                data.items.map(async (item) => {
                    if (item.availableSizes?.length) {
                        return item;
                    }

                    try {
                        const productResponse = await fetch(
                            `/api/product-upload?productId=${item.productId}`,
                            { cache: "no-store" }
                        );

                        if (!productResponse.ok) {
                            return item;
                        }

                        const productData = (await productResponse.json()) as { sizes?: string[] } | null;

                        return {
                            ...item,
                            availableSizes: productData?.sizes ?? [],
                        };
                    } catch (error) {
                        console.error("Wishlist size load error:", error);
                        return item;
                    }
                })
            );

            setWishlistItems(enrichedItems);
        } catch (error) {
            console.error("Load wishlist error:", error);
            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadWishlist();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [loadWishlist]);

    const removeWishlistItem = (productId: string) => {
        void (async () => {
            try {
                const response = await fetch("/api/wishlist", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "remove",
                        productId,
                    }),
                });
                const data = (await response.json()) as WishlistResponse;

                if (!response.ok || !data.success) {
                    return;
                }

                setWishlistItems(data.items);
                window.dispatchEvent(new Event("wishlistUpdated"));
            } catch (error) {
                console.error("Remove wishlist item error:", error);
            }
        })();
    };

    const updateWishlistSize = (
        productId: string,
        size: string
    ) => {
        void (async () => {
            try {
                const response = await fetch("/api/wishlist", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "updateSize",
                        productId,
                        size,
                    }),
                });
                const data = (await response.json()) as WishlistResponse;

                if (!response.ok || !data.success) {
                    return;
                }

                setWishlistItems((prev) =>
                    prev.map((item) => {
                        const updatedItem = data.items.find(
                            (wishlistItem) => wishlistItem.productId === item.productId
                        );

                        return updatedItem
                            ? { ...updatedItem, availableSizes: item.availableSizes ?? updatedItem.availableSizes }
                            : item;
                    })
                );
                window.dispatchEvent(new Event("wishlistUpdated"));
            } catch (error) {
                console.error("Wishlist size update error:", error);
            }
        })();
    };

    const moveToBag = (item: WishlistItem) => {
        void (async () => {
            try {
                if (!item.size) {
                    if (item.availableSizes?.length) {
                        alert("Please choose a size in wishlist before moving this item to bag.");
                        return;
                    }

                    alert("Product sizes are unavailable right now. Please open the product page and try again.");
                    router.push(item.href);
                    return;
                }

                const cartItem: CartItem = {
                    productId: item.productId,
                    title: item.title,
                    brand: item.brand,
                    image: item.image,
                    price: item.price,
                    originalPrice: item.originalPrice,
                    discount: item.discount,
                    size: item.size,
                    quantity: 1,
                    seller: item.seller,
                    stock: item.stock,
                };

                const response = await fetch("/api/cart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ item: cartItem }),
                });
                const data = (await response.json()) as CartResponse;

                if (!response.ok || !data.success) {
                    alert("Failed to move product to bag");
                    return;
                }

                window.dispatchEvent(new Event("cartUpdated"));
                removeWishlistItem(item.productId);
                alert(`Product moved to bag with size ${item.size}`);
            } catch (error) {
                console.error("Move to bag error:", error);
                alert("Failed to move product to bag");
            }
        })();
    };

    return (
        <div className="cartPage pad100">
            <div className="container">
                <div className="mainTitle">
                    <h2>My Wishlist</h2>
                </div>

                {loading ? <p>Loading wishlist...</p> : null}

                {!loading && wishlistItems.length === 0 ? (
                    <div className="wishlistEmpty">
                        <h4>Your wishlist is empty</h4>
                        <p>Save products here so you can come back to them later.</p>
                        <Link href="/">Continue shopping</Link>
                    </div>
                ) : (
                    <div className="wishlistGrid">
                        {wishlistItems.map((item) => (
                            <div className="wishlistCard" key={item.productId}>
                                <Link href={item.href} className="wishlistImage">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        width={260}
                                        height={320}
                                    />
                                </Link>

                                <div className="wishlistContent">
                                    <h5>{item.brand}</h5>
                                    <p>{item.title}</p>
                                    {item.size ? (
                                        <p>Size: {item.size}</p>
                                    ) : (
                                        <p>Size not selected yet</p>
                                    )}
                                    {item.availableSizes?.length ? (
                                        <div className="wishlistSizes">
                                            {item.availableSizes.map((size) => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    className={item.size === size ? "active" : ""}
                                                    onClick={() => updateWishlistSize(item.productId, size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}
                                    <div className="wishlistPrice">
                                        <strong>Rs. {item.price}</strong>
                                        {item.originalPrice ? (
                                            <span className="strike">Rs. {item.originalPrice}</span>
                                        ) : null}
                                        {item.discount ? (
                                            <span className="off">{item.discount}% OFF</span>
                                        ) : null}
                                    </div>

                                    <div className="wishlistActions">
                                        <button type="button" onClick={() => moveToBag(item)}>
                                            MOVE TO BAG
                                        </button>
                                        <button
                                            type="button"
                                            className="secondary"
                                            onClick={() => removeWishlistItem(item.productId)}
                                        >
                                            REMOVE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Page;
