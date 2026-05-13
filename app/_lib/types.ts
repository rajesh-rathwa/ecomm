type ChatMessage = {
    role: "user" | "assistant",
    content: string
}

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

type CartResponse = {
    success: boolean;
    items: CartItem[];
    cartCount: number;
};

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

type WishlistResponse = {
    success: boolean;
    items: WishlistItem[];
    wishlistCount: number;
};

export type { CartItem, CartResponse, WishlistItem, WishlistResponse, ChatMessage }
