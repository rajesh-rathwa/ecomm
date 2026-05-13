import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/utills/mongoose";
import type { WishlistItem, WishlistResponse } from "@/app/_lib/types";
import Wishlist from "@/app/models/Wishlist";

const WISHLIST_COOKIE_NAME = "wishlistSessionId";
const WISHLIST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type WishlistActionRequest =
    | { action: "remove"; productId: string }
    | { action: "updateSize"; productId: string; size: string }
    | { action: "clear" };

// This function makes the final response format for wishlist API.
const buildWishlistResponse = (items: WishlistItem[]): WishlistResponse => ({
    success: true,
    items,
    wishlistCount: items.length,
});

// This function gets old wishlist session id from cookie.
// If cookie is not there, it creates a new session id.
async function getOrCreateSessionId() {
    const cookieStore = await cookies();
    const existingSessionId = cookieStore.get(WISHLIST_COOKIE_NAME)?.value;

    if (existingSessionId) {
        return { sessionId: existingSessionId, shouldSetCookie: false };
    }

    return {
        sessionId: randomUUID(),
        shouldSetCookie: true,
    };
}

// This function sets wishlist session id in browser cookie.
function attachWishlistCookie(response: NextResponse, sessionId: string) {
    response.cookies.set(WISHLIST_COOKIE_NAME, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: WISHLIST_COOKIE_MAX_AGE,
    });
}

// GET function is used to get all wishlist items and item count.
export async function GET() {
    try {
        await connectDB();

        const { sessionId, shouldSetCookie } = await getOrCreateSessionId();
        const wishlist = await Wishlist.findOne({ sessionId }).lean<{ items?: WishlistItem[] } | null>();
        const response = NextResponse.json(buildWishlistResponse(wishlist?.items ?? []));

        if (shouldSetCookie) {
            attachWishlistCookie(response, sessionId);
        }

        return response;
    } catch (error) {
        console.error("Wishlist GET error:", error);
        return NextResponse.json(
            { success: false, items: [], wishlistCount: 0 },
            { status: 500 }
        );
    }
}

// POST function is used to add new item in wishlist.
// If item already exists, it updates that item data.
export async function POST(req: Request) {
    try {
        await connectDB();

        const body = (await req.json()) as { item?: WishlistItem };
        const item = body.item;

        if (!item?.productId || !item.href) {
            return NextResponse.json(
                { success: false, message: "Product and href are required" },
                { status: 400 }
            );
        }

        const { sessionId, shouldSetCookie } = await getOrCreateSessionId();
        const wishlist = await Wishlist.findOne({ sessionId });

        if (!wishlist) {
            const createdWishlist = await Wishlist.create({
                sessionId,
                items: [item],
            });
            const response = NextResponse.json(buildWishlistResponse(createdWishlist.items));

            if (shouldSetCookie) {
                attachWishlistCookie(response, sessionId);
            }

            return response;
        }

        const itemExists = wishlist.items.some(
            (wishlistItem: WishlistItem) => wishlistItem.productId === item.productId
        );

        if (itemExists) {
            wishlist.items = wishlist.items.map((wishlistItem: WishlistItem) =>
                wishlistItem.productId === item.productId
                    ? {
                        ...wishlistItem,
                        ...item,
                    }
                    : wishlistItem
            );
            await wishlist.save();
        } else {
            wishlist.items.push(item);
            await wishlist.save();
        }

        const response = NextResponse.json(buildWishlistResponse(wishlist.items));

        if (shouldSetCookie) {
            attachWishlistCookie(response, sessionId);
        }

        return response;
    } catch (error) {
        console.error("Wishlist POST error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update wishlist" },
            { status: 500 }
        );
    }
}

// PATCH function is used to update wishlist data.
// Here we can remove item, update size, or clear full wishlist.
export async function PATCH(req: Request) {
    try {
        await connectDB();

        const { sessionId, shouldSetCookie } = await getOrCreateSessionId();
        const body = (await req.json()) as WishlistActionRequest;
        const wishlist = await Wishlist.findOne({ sessionId });

        if (!wishlist) {
            const emptyResponse = NextResponse.json(buildWishlistResponse([]));

            if (shouldSetCookie) {
                attachWishlistCookie(emptyResponse, sessionId);
            }

            return emptyResponse;
        }

        if (body.action === "clear") {
            wishlist.items = [];
        }

        if (body.action === "remove") {
            wishlist.items = wishlist.items.filter(
                (item: WishlistItem) => item.productId !== body.productId
            );
        }

        if (body.action === "updateSize") {
            wishlist.items = wishlist.items.map((item: WishlistItem) => {
                if (item.productId !== body.productId) {
                    return item;
                }

                return {
                    ...item,
                    size: body.size,
                };
            });
        }

        await wishlist.save();

        const response = NextResponse.json(buildWishlistResponse(wishlist.items));

        if (shouldSetCookie) {
            attachWishlistCookie(response, sessionId);
        }

        return response;
    } catch (error) {
        console.error("Wishlist PATCH error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update wishlist" },
            { status: 500 }
        );
    }
}
