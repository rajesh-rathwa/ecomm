import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/utills/mongoose";
import type { CartItem, CartResponse } from "@/app/_lib/types";
import Cart from "@/app/models/Cart";

const CART_COOKIE_NAME = "cartSessionId";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type CartActionRequest =
    | { action: "remove"; productId: string; size: string }
    | { action: "updateQuantity"; productId: string; size: string; type: "increase" | "decrease" }
    | { action: "clear" };

// This function makes final response data for cart API.
// It also calculates total cart item count.
const buildCartResponse = (items: CartItem[]): CartResponse => ({
    success: true,
    items,
    cartCount: items.reduce((total, item) => total + item.quantity, 0),
});

// This function gets old cart session id from cookie.
// If cookie is not there, it creates a new session id.
async function getOrCreateSessionId() {
    const cookieStore = await cookies();
    const existingSessionId = cookieStore.get(CART_COOKIE_NAME)?.value;

    if (existingSessionId) {
        return { sessionId: existingSessionId, shouldSetCookie: false };
    }

    return {
        sessionId: randomUUID(),
        shouldSetCookie: true,
    };
}

// This function sets cart session id in browser cookie.
function attachCartCookie(response: NextResponse, sessionId: string) {
    response.cookies.set(CART_COOKIE_NAME, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: CART_COOKIE_MAX_AGE,
    });
}

// GET function is used to get all cart items and total item count.
export async function GET() {
    try {
        await connectDB();

        const { sessionId, shouldSetCookie } = await getOrCreateSessionId();
        const cart = await Cart.findOne({ sessionId }).lean<{ items?: CartItem[] } | null>();
        const response = NextResponse.json(buildCartResponse(cart?.items ?? []));

        if (shouldSetCookie) {
            attachCartCookie(response, sessionId);
        }

        return response;
    } catch (error) {
        console.error("Cart GET error:", error);
        return NextResponse.json(
            { success: false, items: [], cartCount: 0 },
            { status: 500 }
        );
    }
}

// POST function is used to add new item in cart.
// If same product and size already exist, it increases quantity.
export async function POST(req: Request) {
    try {
        await connectDB();

        const body = (await req.json()) as { item?: CartItem };
        const item = body.item;

        if (!item?.productId || !item.size) {
            return NextResponse.json(
                { success: false, message: "Product and size are required" },
                { status: 400 }
            );
        }

        const { sessionId, shouldSetCookie } = await getOrCreateSessionId();
        const cart = await Cart.findOne({ sessionId });

        if (!cart) {
            const createdCart = await Cart.create({
                sessionId,
                items: [item],
            });
            const response = NextResponse.json(buildCartResponse(createdCart.items));

            if (shouldSetCookie) {
                attachCartCookie(response, sessionId);
            }

            return response;
        }

        const existingItemIndex = cart.items.findIndex(
            (cartItem: CartItem) =>
                cartItem.productId === item.productId &&
                cartItem.size === item.size
        );

        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += item.quantity || 1;
        } else {
            cart.items.push({
                ...item,
                quantity: item.quantity || 1,
            });
        }

        await cart.save();

        const response = NextResponse.json(buildCartResponse(cart.items));

        if (shouldSetCookie) {
            attachCartCookie(response, sessionId);
        }

        return response;
    } catch (error) {
        console.error("Cart POST error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update cart" },
            { status: 500 }
        );
    }
}

// PATCH function is used to update cart data.
// Here we can remove item, change quantity, or clear full cart.
export async function PATCH(req: Request) {
    try {
        await connectDB();

        const { sessionId, shouldSetCookie } = await getOrCreateSessionId();
        const body = (await req.json()) as CartActionRequest;
        const cart = await Cart.findOne({ sessionId });

        if (!cart) {
            const emptyResponse = NextResponse.json(buildCartResponse([]));

            if (shouldSetCookie) {
                attachCartCookie(emptyResponse, sessionId);
            }

            return emptyResponse;
        }

        if (body.action === "clear") {
            cart.items = [];
        }

        if (body.action === "remove") {
            cart.items = cart.items.filter(
                (item: CartItem) =>
                    !(item.productId === body.productId && item.size === body.size)
            );
        }

        if (body.action === "updateQuantity") {
            cart.items = cart.items.map((item: CartItem) => {
                if (item.productId !== body.productId || item.size !== body.size) {
                    return item;
                }

                const nextQuantity =
                    body.type === "increase"
                        ? item.quantity + 1
                        : Math.max(1, item.quantity - 1);

                return {
                    ...item,
                    quantity: nextQuantity,
                };
            });
        }

        await cart.save();

        const response = NextResponse.json(buildCartResponse(cart.items));

        if (shouldSetCookie) {
            attachCartCookie(response, sessionId);
        }

        return response;
    } catch (error) {
        console.error("Cart PATCH error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update cart" },
            { status: 500 }
        );
    }
}
