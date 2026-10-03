import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutFormData } from "../schemas/checkoutSchema";
import { useCartStore } from "../store/cartStore";
import { paymentApi } from "../api/paymentApi";
import { MultiPaymentOptions } from "./MultiPaymentOptions";
import type { Order, PaymentIntentResponse } from "../types/payment";

export function CheckoutForm() {
    const { cartItems, getTotal, clearCart } = useCartStore();
    const total = getTotal();

    const [step, setStep] = useState<"shipping" | "payment" | "success">("shipping");
    const [isLoadingIntent, setIsLoadingIntent] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponse | null>(null);
    const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
    });

    const onShippingSubmit = async (data: CheckoutFormData) => {
        if (cartItems.length === 0) {
            setApiError("Your cart is empty. Please add products to cart before checkout.");
            return;
        }

        setIsLoadingIntent(true);
        setApiError(null);

        try {
            const payload = {
                items: cartItems.map((item) => ({
                    productId: item.product.productId,
                    quantity: item.quantity,
                })),
                customerName: data.name,
                customerEmail: data.email,
                customerPhone: data.phone,
                shippingAddress: data.address,
            };

            const response = await paymentApi.createPaymentIntent(payload);
            setPaymentIntent(response);
            setStep("payment");
        } catch (err: any) {
            setApiError(
                err.response?.data?.message ||
                err.message ||
                "Failed to initialize Stripe payment. Please check backend connection."
            );
        } finally {
            setIsLoadingIntent(false);
        }
    };

    const handleOrderSuccess = (order: Order) => {
        setConfirmedOrder(order);
        clearCart();
        setStep("success");
    };

    const handleStartNewOrder = () => {
        setStep("shipping");
        setPaymentIntent(null);
        setConfirmedOrder(null);
        reset();
    };

    return (
        <div className="checkout">
            {/* Step Navigation Progress */}
            <div className="checkout-stepper">
                <div className={`step-item ${step === "shipping" ? "active" : "completed"}`}>
                    <span className="step-number">1</span>
                    <span className="step-label">Shipping Details</span>
                </div>
                <div className="step-divider"></div>
                <div className={`step-item ${step === "payment" ? "active" : step === "success" ? "completed" : ""}`}>
                    <span className="step-number">2</span>
                    <span className="step-label">Payment Options</span>
                </div>
                <div className="step-divider"></div>
                <div className={`step-item ${step === "success" ? "active" : ""}`}>
                    <span className="step-number">3</span>
                    <span className="step-label">Order Confirmed</span>
                </div>
            </div>

            {/* STEP 1: SHIPPING FORM */}
            {step === "shipping" && (
                <div>
                    <h2>Checkout & Shipping Address</h2>

                    {cartItems.length === 0 ? (
                        <div className="empty-checkout-notice">
                            <p>🛒 Your cart is currently empty.</p>
                            <span>Add products from the catalog above to proceed with checkout.</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onShippingSubmit)}>
                            {apiError && (
                                <div className="stripe-error-banner">
                                    ⚠️ {apiError}
                                </div>
                            )}

                            {/* Name */}
                            <div>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="error-message">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label>Email Address (For receipt & order updates)</label>
                                <input
                                    type="email"
                                    placeholder="e.g. john@example.com"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="error-message">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label>Phone Number (10 digits)</label>
                                <input
                                    type="tel"
                                    placeholder="9876543210"
                                    {...register("phone")}
                                />
                                {errors.phone && (
                                    <p className="error-message">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label>Shipping Address</label>
                                <textarea
                                    placeholder="Street address, apartment, city, state, postal code"
                                    {...register("address")}
                                />
                                {errors.address && (
                                    <p className="error-message">{errors.address.message}</p>
                                )}
                            </div>

                            {/* Total summary */}
                            <div className="checkout-summary-box">
                                <div>Items in Cart: <strong>{cartItems.reduce((acc, i) => acc + i.quantity, 0)}</strong></div>
                                <h3>Total to Pay: ₹{total.toFixed(2)}</h3>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoadingIntent}
                                className="checkout-submit-btn"
                            >
                                {isLoadingIntent ? (
                                    <span className="btn-spinner-content">
                                        <span className="spinner"></span> Initializing Gateway...
                                    </span>
                                ) : (
                                    "Continue to Payment Options →"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* STEP 2: MULTI-PAYMENT OPTIONS */}
            {step === "payment" && paymentIntent && (
                <div>
                    <MultiPaymentOptions
                        paymentIntent={paymentIntent}
                        onSuccess={handleOrderSuccess}
                        onCancel={() => setStep("shipping")}
                    />
                </div>
            )}

            {/* STEP 3: ORDER SUCCESS RECEIPT */}
            {step === "success" && confirmedOrder && (
                <div className="order-receipt-card">
                    <div className="receipt-success-icon">✓</div>
                    <h2>Order Confirmed!</h2>
                    <p className="receipt-subtitle">
                        Thank you for your purchase. Your order has been placed successfully.
                    </p>

                    <div className="receipt-details">
                        <div className="receipt-row">
                            <span>Order Number:</span>
                            <strong>#{confirmedOrder.id}</strong>
                        </div>
                        <div className="receipt-row">
                            <span>Status:</span>
                            <span className="status-paid-badge">{confirmedOrder.status}</span>
                        </div>
                        <div className="receipt-row">
                            <span>Payment Method:</span>
                            <strong>{confirmedOrder.paymentMethod || "CARD"}</strong>
                        </div>
                        <div className="receipt-row">
                            <span>Amount:</span>
                            <strong className="receipt-amount">
                                {confirmedOrder.currency === "USD" ? "$" : "₹"}
                                {confirmedOrder.totalAmount.toFixed(2)}
                            </strong>
                        </div>
                        <div className="receipt-row">
                            <span>Customer Name:</span>
                            <span>{confirmedOrder.customerName}</span>
                        </div>
                        <div className="receipt-row">
                            <span>Email:</span>
                            <span>{confirmedOrder.customerEmail}</span>
                        </div>
                        <div className="receipt-row">
                            <span>Deliver To:</span>
                            <span>{confirmedOrder.shippingAddress}</span>
                        </div>
                        <div className="receipt-row">
                            <span>Transaction / Ref ID:</span>
                            <code className="receipt-ref">
                                {confirmedOrder.transactionRef || confirmedOrder.paymentIntentId}
                            </code>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleStartNewOrder}
                        className="new-order-btn"
                    >
                        🛍️ Continue Shopping
                    </button>
                </div>
            )}
        </div>
    );
}

export default CheckoutForm;
