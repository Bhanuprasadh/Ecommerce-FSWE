import { useState } from "react";

import ProductList from "./components/productList";
import Cart from "./components/Cart";
import CheckoutForm from "./components/CheckoutForm";

import type { Product } from "./types/produtcs"
import type { CartItem } from "./types/Cart";

function App() {

    // Cart state
    const [cartItems, setCartItems] =
        useState<CartItem[]>([]);

    // Add product to cart
    const addToCart = (product: Product) => {

        setCartItems((currentItems) => {

            const existingItem =
                currentItems.find(
                    (item) =>
                        item.product.productId ===
                        product.productId
                );

            if (existingItem) {

                return currentItems.map((item) =>

                    item.product.productId ===
                    product.productId

                        ? {
                            ...item,
                            quantity: item.quantity + 1
                        }

                        : item
                );
            }

            return [
                ...currentItems,
                {
                    product: product,
                    quantity: 1
                }
            ];
        });
    };

    // Increase quantity
    const increaseQuantity = (productId: number) => {

        setCartItems((currentItems) =>

            currentItems.map((item) =>

                item.product.productId === productId

                    ? {
                        ...item,
                        quantity: item.quantity + 1
                    }

                    : item
            )
        );
    };

    // Decrease quantity
    const decreaseQuantity = (productId: number) => {

        setCartItems((currentItems) =>

            currentItems
                .map((item) =>

                    item.product.productId === productId

                        ? {
                            ...item,
                            quantity: item.quantity - 1
                        }

                        : item
                )

                .filter(
                    (item) => item.quantity > 0
                )
        );
    };

    // Calculate total
    const total = cartItems.reduce(
        (sum, item) =>
            sum + item.product.price * item.quantity,
        0
    );

    return (
        <div className="container">

            <h1>
                E-Commerce Product Management System
            </h1>

            <p className="subtitle">
                Browse Products
            </p>

            {/* Product List */}

            <ProductList
                onAddToCart={addToCart}
            />

            {/* Cart */}

            <Cart
                cartItems={cartItems}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
            />

            {/* Checkout Form */}

            <CheckoutForm
                total={total}
            />

        </div>
    );
}

export default App;

