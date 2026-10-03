interface CartItem {
    product: {
        productId: number;
        imageUrl: string;
        productName: string;
        price: number;
    };
    quantity: number;
}

interface CartProps {
    cartItems: CartItem[];
    onIncrease: (productId: number) => void;
    onDecrease: (productId: number) => void;
}

function Cart({
    cartItems,
    onIncrease,
    onDecrease
}: CartProps) {

    const total = cartItems.reduce(
        (sum, item) =>
            sum + item.product.price * item.quantity,
        0
    );

    return (
        <div className="cart">

            <h2>Shopping Cart</h2>

            {cartItems.length === 0 ? (

                <p>Your cart is empty.</p>

            ) : (

                <>
                    {cartItems.map((item) => (

                        <div
                            className="cart-item"
                            key={item.product.productId}
                        >

                            <img
                                src={item.product.imageUrl}
                                alt={item.product.productName}
                            />

                            <div>

                                <h3>
                                    {item.product.productName}
                                </h3>

                                <p>
                                    Price: ₹{item.product.price}
                                </p>

                                <div>

                                    <button
                                        onClick={() =>
                                            onDecrease(
                                                item.product.productId
                                            )
                                        }
                                    >
                                        -
                                    </button>

                                    <span>
                                        {" "}
                                        {item.quantity}
                                        {" "}
                                    </span>

                                    <button
                                        onClick={() =>
                                            onIncrease(
                                                item.product.productId
                                            )
                                        }
                                    >
                                        +
                                    </button>

                                </div>

                                <p>
                                    Subtotal: ₹
                                    {item.product.price *
                                        item.quantity}
                                </p>

                            </div>

                        </div>

                    ))}

                    <h2>
                        Total: ₹{total}
                    </h2>
                </>

            )}

        </div>
    );
}
export default Cart;
