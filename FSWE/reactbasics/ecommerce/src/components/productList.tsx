import { useState } from "react";
import { products } from "../data/products";
import ProductCard from "./ProductCard";
import type { Product } from "../types/produtcs";

interface ProductListProps {
    onAddToCart: (product: Product) => void;
}

function ProductList({
    onAddToCart
}: ProductListProps) {

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const categories = [
        "All",
        "Electronics",
        "Footwear",
        "Accessories"
    ];

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.productName
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesCategory =
            category === "All" ||
            product.category === category;

        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            {/* Search and Category Filter */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search products"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />
                <select
                    value={category}
                    onChange={(e) =>
                        setCategory(e.target.value)
                    }
                >
                    {categories.map((item) => (

                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>
                    ))}
                </select>
            </div>

            {/* Product Grid */}
            <div className="product-grid">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.productId}
                        product={product}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </div>
        </div>
    );
}
