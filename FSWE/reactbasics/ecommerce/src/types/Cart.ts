import type { Product } from "../types/produtcs";

export interface CartItem {
    product: Product;
    quantity: number;
}
