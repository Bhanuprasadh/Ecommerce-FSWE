import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

interface StripeElementsFormProps {
    amount: number;
    currency: string;
    onSuccess: (paymentIntentId: string) => void;
    onError: (msg: string) => void;
}

export function StripeElementsForm({
    amount,
    currency,
    onSuccess,
    onError,
}: StripeElementsFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsSubmitting(true);
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (error) {
            onError(error.message || "Payment authorization failed");
            setIsSubmitting(false);
        } else if (
            paymentIntent &&
            (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")
        ) {
            onSuccess(paymentIntent.id);
        } else {
            onError("Payment was not completed.");
            setIsSubmitting(false);
        }
    };

    const currencySymbol = currency === "USD" ? "$" : "₹";

    return (
        <form onSubmit={handleSubmit} className="stripe-card-form">
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || isSubmitting}
                className="stripe-pay-btn"
                style={{ marginTop: "24px" }}
            >
                {isSubmitting ? (
                    <span className="btn-spinner-content">
                        <span className="spinner"></span> Authorizing with Stripe...
                    </span>
                ) : (
                    `Pay ${currencySymbol}${amount.toFixed(2)} with Stripe`
                )}
            </button>
        </form>
    );
}
