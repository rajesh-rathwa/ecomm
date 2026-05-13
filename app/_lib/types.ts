// This type stores one chat message with sender role and message text.
type ChatMessage = {
    role: "user" | "assistant",
    content: string
}

// This type stores one cart product item data.
type CartItem = {
    productId: string;
    title: string;
    brand: string;
    image: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    size: string;
    quantity: number;
    seller?: string;
    stock?: number;
};

// This type stores cart API response data.
type CartResponse = {
    success: boolean;
    items: CartItem[];
    cartCount: number;
};

// This type stores one wishlist product item data.
type WishlistItem = {
    productId: string;
    title: string;
    brand: string;
    image: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    size?: string;
    availableSizes?: string[];
    seller?: string;
    stock?: number;
    href: string;
};

// This type stores wishlist API response data.
type WishlistResponse = {
    success: boolean;
    items: WishlistItem[];
    wishlistCount: number;
};

export type { CartItem, CartResponse, WishlistItem, WishlistResponse, ChatMessage }
