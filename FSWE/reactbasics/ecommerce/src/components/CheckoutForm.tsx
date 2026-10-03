import { useState } from "react";

interface CheckoutFormProps {
    total: number;
}

function CheckoutForm({ total }: CheckoutFormProps) {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();

        alert(
            `Order placed successfully!\n\n` +
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Phone: ${phone}\n` +
            `Address: ${address}\n` +
            `Total: ₹${total}`
        );
    };

    return (
        <div className="checkout">

            <h2>Checkout</h2>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Phone</label>

                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Address</label>

                    <textarea
                        value={address}
                        onChange={(e) =>
                            setAddress(e.target.value)
                        }
                        required
                    />
                </div>

                <h3>
                    Order Total: ₹{total}
                </h3>

                <button type="submit">
                    Place Order
                </button>

            </form>

        </div>
    );
}

export default CheckoutForm;
