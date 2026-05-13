"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import type { CartItem, CartResponse } from "@/app/_lib/types";

function Page() {

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [orderForm, setOrderForm] = useState({
        name: "",
        mobile: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    const loadCart = React.useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch("/api/cart", {
                cache: "no-store",
            });
            const data = (await response.json()) as CartResponse;

            if (!response.ok || !data.success) {
                setCartItems([]);
                return;
            }

            setCartItems(data.items);
        } catch (error) {
            console.error("Load cart error:", error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadCart();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [loadCart]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        setOrderForm({
            ...orderForm,
            [e.target.name]: e.target.value,
        });

    };

    const removeItem = (
        productId: string,
        size: string
    ) => {
        void (async () => {
            try {
                const response = await fetch("/api/cart", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "remove",
                        productId,
                        size,
                    }),
                });
                const data = (await response.json()) as CartResponse;

                if (!response.ok || !data.success) {
                    return;
                }

                setCartItems(data.items);
                window.dispatchEvent(
                    new Event("cartUpdated")
                );
            } catch (error) {
                console.error("Remove cart item error:", error);
            }
        })();
    };

    const updateQuantity = (
        productId: string,
        size: string,
        type: "increase" | "decrease"
    ) => {
        void (async () => {
            try {
                const response = await fetch("/api/cart", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "updateQuantity",
                        productId,
                        size,
                        type,
                    }),
                });
                const data = (await response.json()) as CartResponse;

                if (!response.ok || !data.success) {
                    return;
                }

                setCartItems(data.items);
                window.dispatchEvent(
                    new Event("cartUpdated")
                );
            } catch (error) {
                console.error("Update cart quantity error:", error);
            }
        })();
    };

    const totalMRP = cartItems.reduce(
        (acc, item) =>
            acc +
            (item.originalPrice || item.price)
            * item.quantity,
        0
    );

    const totalPrice = cartItems.reduce(
        (acc, item) =>
            acc +
            item.price * item.quantity,
        0
    );

    const totalDiscount =
        totalMRP - totalPrice;

    const finalAmount =
        totalPrice + 23;

    const handlePlaceOrder =
        async () => {

            if (
                !orderForm.name ||
                !orderForm.mobile ||
                !orderForm.address ||
                !orderForm.city ||
                !orderForm.state ||
                !orderForm.pincode
            ) {

                alert(
                    "Please fill all address fields"
                );

                return;
            }

            if (
                cartItems.length === 0
            ) {

                alert(
                    "Your cart is empty"
                );

                return;
            }

            const orderData = {

                customer: orderForm,

                products: cartItems,

                totalMRP,

                totalDiscount,

                finalAmount,

                paymentMethod:
                    "COD",

                orderDate:
                    new Date(),
            };

            try {

                const res =
                    await fetch(
                        "/api/orders",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify(
                                orderData
                            ),
                        }
                    );

                const data =
                    await res.json();

                if (
                    data.success
                ) {

                    alert(
                        "Order placed successfully"
                    );

                    await fetch("/api/cart", {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            action: "clear",
                        }),
                    });

                    setCartItems([]);

                    window.dispatchEvent(
                        new Event(
                            "cartUpdated"
                        )
                    );

                    window.location.href =
                        "/order-success";

                } else {

                    alert(
                        "Failed to place order"
                    );

                }

            } catch (error) {

                console.error(error);

            }
        };

    return (

        <div className="cartPage pad100">

            <div className="container">

                <div className="cartContainer">

                    <div className="cartLeft">

                        {loading ? (
                            <h2>
                                Loading cart...
                            </h2>
                        ) : null}

                        {!loading && cartItems.length === 0 ? (

                            <h2>
                                Your cart is empty
                            </h2>

                        ) : (

                            cartItems.map((item) => (

                                <div
                                    className="cartItem"
                                    key={`${item.productId}-${item.size}`}
                                >

                                    <input type="checkbox" />

                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        width={100}
                                        height={100}
                                    />

                                    <div className="itemDetails">

                                        <h4>
                                            {item.brand}
                                        </h4>

                                        <p>
                                            {item.title}
                                        </p>

                                        <div className="meta">

                                            <span>
                                                Size:
                                                {" "}
                                                {item.size}
                                            </span>

                                            <div className="qtyBox">

                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.size,
                                                            "decrease"
                                                        )
                                                    }
                                                >
                                                    -
                                                </button>

                                                <span>
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.size,
                                                            "increase"
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>

                                            </div>

                                        </div>

                                        <div className="price">

                                            Rs. {item.price}

                                            {item.originalPrice ? (

                                                <span className="strike">
                                                    Rs. {item.originalPrice}
                                                </span>

                                            ) : null}

                                            {item.discount ? (

                                                <span className="off">
                                                    {item.discount}% OFF
                                                </span>

                                            ) : null}

                                        </div>

                                        <p className="delivery">
                                            Seller:
                                            {" "}
                                            {item.seller}
                                        </p>

                                    </div>

                                    <span
                                        className="remove"
                                        onClick={() =>
                                            removeItem(
                                                item.productId,
                                                item.size
                                            )
                                        }
                                        style={{
                                            cursor:
                                                "pointer"
                                        }}
                                    >
                                        X
                                    </span>

                                </div>

                            ))
                        )}

                    </div>

                    <div className="cartRight">

                        <div className="checkoutForm">

                            <h3>
                                Delivery Address
                            </h3>

                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={orderForm.name}
                                onChange={handleInputChange}
                            />

                            <input
                                type="text"
                                name="mobile"
                                placeholder="Mobile Number"
                                value={orderForm.mobile}
                                onChange={handleInputChange}
                            />

                            <input
                                type="text"
                                name="address"
                                placeholder="Full Address"
                                value={orderForm.address}
                                onChange={handleInputChange}
                            />

                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={orderForm.city}
                                onChange={handleInputChange}
                            />

                            <input
                                type="text"
                                name="state"
                                placeholder="State"
                                value={orderForm.state}
                                onChange={handleInputChange}
                            />

                            <input
                                type="text"
                                name="pincode"
                                placeholder="Pincode"
                                value={orderForm.pincode}
                                onChange={handleInputChange}
                            />

                        </div>

                        <div className="priceDetails">

                            <h4>
                                PRICE DETAILS
                            </h4>

                            <div className="row">
                                <span>
                                    Total MRP
                                </span>

                                <span>
                                    Rs. {totalMRP}
                                </span>
                            </div>

                            <div className="row discount">
                                <span>
                                    Discount
                                </span>

                                <span>
                                    - Rs. {totalDiscount}
                                </span>
                            </div>

                            <div className="row">
                                <span>
                                    Platform Fee
                                </span>

                                <span>
                                    Rs. 23
                                </span>
                            </div>

                            <hr />

                            <div className="row total">
                                <span>
                                    Total Amount
                                </span>

                                <span>
                                    Rs. {finalAmount}
                                </span>
                            </div>

                            <button
                                className="placeOrder"
                                onClick={handlePlaceOrder}
                            >
                                PLACE ORDER
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Page;
