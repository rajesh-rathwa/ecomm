"use client";

import Link from "next/link";
import Image from "next/image";
import { megaMenu } from "./megaMenu";
import { useGet } from "@/app/_lib/hooks/useGet";
import type { CartResponse, WishlistResponse } from "@/app/_lib/types";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import React from "react";

type Category = {
    _id: string;
    mainCategory: string;
    subCategories: {
        name: string;
        subSubCategories: string[];
    }[];
};

type MenuItem = { label: string; link: string };
type MenuColumn = { title: string; items: MenuItem[] };
type HeaderMenu = { id: string; label: string; columns: MenuColumn[] };

// This function changes normal text into URL-friendly text.
// Example: "Men Shoes" becomes "men-shoes".
const toSlug = (value: string) => value.toLowerCase().trim().replace(/\s+/g, "-");

// This Header component shows logo, menu, search, profile, wishlist and cart section.
function Header() {
    const { data: categories, loading } = useGet<Category[]>("/api/categories", []);
    const { data: session, status } = useSession();
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        // This function gets latest cart item count from API.
        const updateCartCount = async () => {
            try {
                const response = await fetch("/api/cart", {
                    cache: "no-store",
                });
                const data = (await response.json()) as CartResponse;

                if (!response.ok || !data.success) {
                    setCartCount(0);
                    return;
                }

                setCartCount(data.cartCount);
            } catch (error) {
                console.error("Cart count error:", error);
                setCartCount(0);
            }
        };

        // This function runs when custom cart update event happens.
        const handleCartUpdated = () => {
            void updateCartCount();
        };

        // First time page loads, cart count will come here.
        void updateCartCount();

        window.addEventListener(
            "cartUpdated",
            handleCartUpdated
        );

        return () => {
            // Cleanup: remove event listener when component unmounts.
            window.removeEventListener(
                "cartUpdated",
                handleCartUpdated
            );
        };
    }, []);

    useEffect(() => {
        // This function gets latest wishlist item count from API.
        const updateWishlistCount = async () => {
            try {
                const response = await fetch("/api/wishlist", {
                    cache: "no-store",
                });
                const data = (await response.json()) as WishlistResponse;

                if (!response.ok || !data.success) {
                    setWishlistCount(0);
                    return;
                }

                setWishlistCount(data.wishlistCount);
            } catch (error) {
                console.error("Wishlist count error:", error);
                setWishlistCount(0);
            }
        };

        // This function runs when custom wishlist update event happens.
        const handleWishlistUpdated = () => {
            void updateWishlistCount();
        };

        // First time page loads, wishlist count will come here.
        void updateWishlistCount();

        window.addEventListener(
            "wishlistUpdated",
            handleWishlistUpdated
        );

        return () => {
            // Cleanup: remove event listener when component unmounts.
            window.removeEventListener(
                "wishlistUpdated",
                handleWishlistUpdated
            );
        };
    }, []);

    // Here API category data is changing into menu format for the header.
    const dynamicMenu: HeaderMenu[] = categories.map((category) => ({
        id: category._id,
        label: category.mainCategory,
        columns: category.subCategories.map((sub) => ({
            title: sub.name,
            items: sub.subSubCategories.map((subSub) => ({
                label: subSub,
                link: `/${toSlug(category.mainCategory)}/${toSlug(sub.name)}/${toSlug(subSub)}`,
            })),
        })),
    }));

    // If dynamic category data is not available, then default megaMenu will show.
    const navigationMenu: HeaderMenu[] =
        dynamicMenu.length > 0 ? dynamicMenu : (megaMenu as HeaderMenu[]);

    return (
        <header className="navigationSection">
            <div className="container">
                <div className="mainLogo">
                    <Link href="/">
                        <Image src="/images/logo.jpg" alt="Company Logo" width={120} height={60} priority />
                    </Link>
                </div>

                <ul className="navigationMenu">
                    {navigationMenu.map((menu) => (
                        <li key={menu.id} className="navItem">
                            <Link href="#">{menu.label}</Link>

                            <div className="megaMenu">
                                {menu.columns.map((col, index) => (
                                    <div className="megaColumn" key={index}>
                                        <h4>{col.title}</h4>
                                        <ul>
                                            {col.items.map((item, i) => (
                                                <li key={i}>
                                                    <Link href={item.link}>{item.label}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </li>
                    ))}
                    {loading && <li className="navItem">Loading...</li>}
                </ul>

                <form className="serachForm">
                    <input type="search" placeholder="Search for products, brands and more" />
                    <button type="submit">
                        <Image src="/images/search.png" alt="Search" width={100} height={100} />
                    </button>
                </form>

                <div className="profileNav">
                    <button className="profileBtn">
                        <Image src="/images/profile.png" alt="Profile" width={100} height={100} /> Profile
                        <div className="profileDopdown">

                            {session && status === "authenticated" ? (
                                <div className="profileLinks">
                                    <Link href="/logout" className="loginButton">
                                        Logout
                                    </Link>
                                </div>
                            ) : (
                                <div className="loginSection">
                                    <p>
                                        <b>Welcome</b> <br /> To access account and manage orders
                                    </p>

                                    <Link href="/signup" className="loginButton">
                                        Login / Signup
                                    </Link>
                                </div>
                            )}
                        </div>
                    </button>
                    <Link href="/wishlist" className="profileBtn">
                        <Image src="/images/wishlist.png" alt="Wishlist" width={100} height={100} />
                        Wishlist ({wishlistCount})
                    </Link>
                    <Link href="/checkout/cart" className="profileBtn">
                        <Image src="/images/bag.png" alt="Bag" width={100} height={100} />
                        Bag ({cartCount})
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;
