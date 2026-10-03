import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsForm } from "./StripeElementsForm";
import { paymentApi } from "../api/paymentApi";
import type { Order, PaymentIntentResponse } from "../types/payment";

interface StripePaymentProps {
    paymentIntent: PaymentIntentResponse;
    onSuccess: (order: Order) => void;
    onCancel: () => void;
}

export function StripePayment({
    paymentIntent,
    onSuccess,
    onCancel,
}: StripePaymentProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Mock form state for simulation mode
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [zip, setZip] = useState("");

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 16);
        const parts = cleaned.match(/[\s\S]{1,4}/g) || [];
        return parts.join(" ");
    };

    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 4);
        if (cleaned.length >= 3) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        }
        return cleaned;
    };

    const handleFillTestCard = () => {
        setCardNumber("4242 4242 4242 4242");
        setExpiry("12/34");
        setCvc("123");
        setZip("90210");
        setErrorMessage(null);
    };

    const handleMockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const rawCard = cardNumber.replace(/\s/g, "");
        if (rawCard.length < 16) {
            setErrorMessage("Please enter a valid 16-digit card number.");
            return;
        }
        if (expiry.length < 5) {
            setErrorMessage("Please enter expiry in MM/YY format.");
            return;
        }
        if (cvc.length < 3) {
            setErrorMessage("Please enter a valid 3-digit CVC.");
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // Simulate 1.2s network authorization
            await new Promise((resolve) => setTimeout(resolve, 1200));
            const confirmedOrder = await paymentApi.confirmOrder(
                paymentIntent.orderId,
                paymentIntent.clientSecret
            );
            setIsProcessing(false);
            onSuccess(confirmedOrder);
        } catch (err: any) {
            setIsProcessing(false);
            setErrorMessage(err.response?.data?.message || err.message || "Failed to process payment");
        }
    };

    const handleLiveStripeSuccess = async (stripePaymentIntentId: string) => {
        setIsProcessing(true);
        try {
            const confirmedOrder = await paymentApi.confirmOrder(
                paymentIntent.orderId,
                stripePaymentIntentId
            );
            setIsProcessing(false);
            onSuccess(confirmedOrder);
        } catch (err: any) {
            setIsProcessing(false);
            setErrorMessage(err.response?.data?.message || "Failed to confirm order with backend");
        }
    };

    const stripePromise = !paymentIntent.mockMode
        ? loadStripe(paymentIntent.publishableKey)
        : null;

    const currencySymbol = paymentIntent.currency === "USD" ? "$" : "₹";

    return (
        <div className="stripe-checkout-container">
            <div className="stripe-header">
                <div className="stripe-branding">
                    <svg viewBox="0 0 60 25" width="60" height="25" fill="#635bff">
                        <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.25c-1.12.55-2.73.84-4.56.84-4.7 0-6.9-2.7-6.9-6.72 0-3.9 2.37-6.83 6.42-6.83 3.96 0 5.85 2.87 5.85 6.7 0 .42 0 .84-.04 1.16zm-4.16-2.82c-.08-1.57-1.04-2.45-2.3-2.45-1.3 0-2.3.9-2.46 2.45h4.76zM34.8 6.42h4.22v13.35H34.8V6.42zm2.11-6.42c1.47 0 2.4 1.05 2.4 2.33 0 1.25-.93 2.3-2.4 2.3-1.48 0-2.4-1.05-2.4-2.3 0-1.28.92-2.33 2.4-2.33zM25.75 6.42h4.2v2.24h.06c.72-1.46 2.3-2.47 4.2-2.47.38 0 .76.04 1.1.13v4.18a6.3 6.3 0 00-1.5-.18c-2.42 0-3.86 1.57-3.86 4.3v5.15h-4.2V6.42zm-8.4 13.58c-1.37 0-2.77-.3-3.98-.84v-3.4c1.16.65 2.5 1.04 3.75 1.04 1.28 0 1.95-.44 1.95-1.14 0-1.87-5.94-.85-5.94-5.63 0-2.14 1.83-3.61 4.56-3.61 1.24 0 2.44.24 3.51.68v3.3a6.8 6.8 0 00-3.32-.78c-1.1 0-1.63.42-1.63 1.02 0 1.76 5.94.81 5.94 5.56 0 2.2-1.8 3.8-4.84 3.8zM4.62 19.77c-1.42 0-2.86-.33-4.1-.9v-3.48c1.23.75 2.68 1.18 4.02 1.18 1.4 0 2.12-.47 2.12-1.2 0-1.97-6.23-.9-6.23-5.88 0-2.23 1.93-3.77 4.82-3.77 1.35 0 2.62.27 3.75.76v3.42a7.3 7.3 0 00-3.56-.88c-1.18 0-1.78.43-1.78 1.06 0 1.85 6.23.85 6.23 5.82 0 2.31-1.92 3.87-5.27 3.87z"/>
                    </svg>
                    <span className="stripe-secure-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                        End-to-End Encrypted
                    </span>
                </div>
                <div className="stripe-amount-badge">
                    <span>Total Due:</span>
                    <strong>{currencySymbol}{paymentIntent.amount.toFixed(2)}</strong>
                </div>
            </div>

            {paymentIntent.mockMode && (
                <div className="stripe-simulation-notice">
                    <div className="notice-content">
                        <strong>Test Mode Simulation</strong>
                        <span>Using test environment. You can click autofill to use Stripe standard test credentials.</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleFillTestCard}
                        className="stripe-test-card-btn"
                    >
                        ⚡ Autofill Test Card (4242)
                    </button>
                </div>
            )}

            {errorMessage && (
                <div className="stripe-error-banner">
                    ⚠️ {errorMessage}
                </div>
            )}

            {!paymentIntent.mockMode && stripePromise ? (
                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret: paymentIntent.clientSecret,
                        appearance: {
                            theme: "stripe",
                            variables: {
                                colorPrimary: "#ff9900",
                                colorBackground: "#ffffff",
                                colorText: "#0f1111",
                                colorDanger: "#b12704",
                                fontFamily: "system-ui, -apple-system, sans-serif",
                                borderRadius: "6px",
                            },
                        },
                    }}
                >
                    <StripeElementsForm
                        amount={paymentIntent.amount}
                        currency={paymentIntent.currency}
                        onSuccess={handleLiveStripeSuccess}
                        onError={(msg) => setErrorMessage(msg)}
                    />
                </Elements>
            ) : (
                <form onSubmit={handleMockSubmit} className="stripe-card-form">
                    <div className="form-group">
                        <label>Card Number</label>
                        <div className="card-input-wrapper">
                            <input
                                type="text"
                                placeholder="4242 4242 4242 4242"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                                required
                            />
                            <div className="card-icons">
                                <span className="card-icon visa">VISA</span>
                                <span className="card-icon mastercard">MC</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label>Expires</label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                maxLength={5}
                                required
                            />
                        </div>
                        <div className="form-group half">
                            <label>CVC / CVV</label>
                            <input
                                type="text"
                                placeholder="123"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                maxLength={4}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>ZIP / Postal Code</label>
                        <input
                            type="text"
                            placeholder="90210"
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            maxLength={10}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="stripe-pay-btn"
                    >
                        {isProcessing ? (
                            <span className="btn-spinner-content">
                                <span className="spinner"></span> Processing Secure Payment...
                            </span>
                        ) : (
                            `Pay ${currencySymbol}${paymentIntent.amount.toFixed(2)} with Stripe`
                        )}
                    </button>
                </form>
            )}

            <div className="stripe-footer">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="stripe-back-btn"
                >
                    ← Back to Shipping Details
                </button>
                <div className="stripe-guarantee">
                    🔒 Guaranteed Safe & Secure 256-Bit SSL Checkout
                </div>
            </div>
        </div>
    );
}
