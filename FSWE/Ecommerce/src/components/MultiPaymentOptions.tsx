import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsForm } from "./StripeElementsForm";
import { paymentApi } from "../api/paymentApi";
import type { Order, PaymentIntentResponse, PaymentMethodType } from "../types/payment";

interface MultiPaymentOptionsProps {
    paymentIntent: PaymentIntentResponse;
    onSuccess: (order: Order) => void;
    onCancel: () => void;
}

export function MultiPaymentOptions({
    paymentIntent,
    onSuccess,
    onCancel,
}: MultiPaymentOptionsProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("CARD");
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Card Form State (for simulation mode)
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [zip, setZip] = useState("");

    // UPI State
    const [upiOption, setUpiOption] = useState<"id" | "qr">("qr");
    const [upiId, setUpiId] = useState("");

    // Net Banking State
    const [selectedBank, setSelectedBank] = useState("HDFC");

    // Helper Card Formatter
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

    // Generic confirmation helper
    const processPaymentConfirmation = async (
        method: PaymentMethodType,
        txnRef: string
    ) => {
        setIsProcessing(true);
        setErrorMessage(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const confirmedOrder = await paymentApi.confirmOrder(
                paymentIntent.orderId,
                paymentIntent.clientSecret,
                method,
                txnRef
            );
            setIsProcessing(false);
            onSuccess(confirmedOrder);
        } catch (err: any) {
            setIsProcessing(false);
            setErrorMessage(err.response?.data?.message || err.message || "Payment processing failed");
        }
    };

    // 1. Card Submit
    const handleCardSubmit = async (e: React.FormEvent) => {
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

        await processPaymentConfirmation("CARD", `CARD-${rawCard.slice(-4)}`);
    };

    // 2. UPI Submit
    const handleUpiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (upiOption === "id") {
            if (!upiId || !upiId.includes("@")) {
                setErrorMessage("Please enter a valid UPI ID (e.g., yourname@okhdfcbank).");
                return;
            }
            await processPaymentConfirmation("UPI", `UPI-${upiId}`);
        } else {
            // QR Code Scan
            await processPaymentConfirmation("UPI", `UPI-QR-${Date.now().toString().slice(-6)}`);
        }
    };

    // 3. Net Banking Submit
    const handleNetBankingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBank) {
            setErrorMessage("Please choose your bank to proceed with Net Banking.");
            return;
        }
        await processPaymentConfirmation("NETBANKING", `NB-${selectedBank}-${Date.now().toString().slice(-6)}`);
    };

    // 4. PayPal Submit
    const handlePayPalSubmit = async () => {
        await processPaymentConfirmation("PAYPAL", `PAYPAL-TXN-${Date.now().toString().slice(-8)}`);
    };

    // 5. Cash on Delivery Submit
    const handleCodSubmit = async () => {
        await processPaymentConfirmation("COD", `COD-REF-${Date.now().toString().slice(-6)}`);
    };

    const stripePromise = !paymentIntent.mockMode && selectedMethod === "CARD"
        ? loadStripe(paymentIntent.publishableKey)
        : null;

    const currencySymbol = paymentIntent.currency === "USD" ? "$" : "₹";

    return (
        <div className="payment-options-container">
            {/* Header */}
            <div className="payment-options-header">
                <div className="payment-title-group">
                    <h3>Select Payment Method</h3>
                    <span className="secure-tag">🔒 256-Bit SSL Secured</span>
                </div>
                <div className="payment-amount-display">
                    <span>Total Payable:</span>
                    <strong>{currencySymbol}{paymentIntent.amount.toFixed(2)}</strong>
                </div>
            </div>

            {errorMessage && (
                <div className="stripe-error-banner">
                    ⚠️ {errorMessage}
                </div>
            )}

            {/* Payment Method Selector Tabs */}
            <div className="payment-layout">
                <div className="payment-method-nav">
                    <button
                        type="button"
                        className={`method-nav-btn ${selectedMethod === "CARD" ? "active" : ""}`}
                        onClick={() => { setSelectedMethod("CARD"); setErrorMessage(null); }}
                    >
                        <span className="method-icon">💳</span>
                        <div className="method-text">
                            <strong>Credit / Debit Card</strong>
                            <small>Stripe, Visa, MasterCard, RuPay</small>
                        </div>
                    </button>

                    <button
                        type="button"
                        className={`method-nav-btn ${selectedMethod === "UPI" ? "active" : ""}`}
                        onClick={() => { setSelectedMethod("UPI"); setErrorMessage(null); }}
                    >
                        <span className="method-icon">📱</span>
                        <div className="method-text">
                            <strong>UPI / QR Code</strong>
                            <small>GPay, PhonePe, Paytm, BHIM</small>
                        </div>
                    </button>

                    <button
                        type="button"
                        className={`method-nav-btn ${selectedMethod === "NETBANKING" ? "active" : ""}`}
                        onClick={() => { setSelectedMethod("NETBANKING"); setErrorMessage(null); }}
                    >
                        <span className="method-icon">🏦</span>
                        <div className="method-text">
                            <strong>Net Banking</strong>
                            <small>HDFC, SBI, ICICI, Axis & more</small>
                        </div>
                    </button>

                    <button
                        type="button"
                        className={`method-nav-btn ${selectedMethod === "PAYPAL" ? "active" : ""}`}
                        onClick={() => { setSelectedMethod("PAYPAL"); setErrorMessage(null); }}
                    >
                        <span className="method-icon">🅿️</span>
                        <div className="method-text">
                            <strong>PayPal</strong>
                            <small>International digital wallet</small>
                        </div>
                    </button>

                    <button
                        type="button"
                        className={`method-nav-btn ${selectedMethod === "COD" ? "active" : ""}`}
                        onClick={() => { setSelectedMethod("COD"); setErrorMessage(null); }}
                    >
                        <span className="method-icon">💵</span>
                        <div className="method-text">
                            <strong>Cash on Delivery</strong>
                            <small>Pay cash at your doorstep</small>
                        </div>
                    </button>
                </div>

                {/* Method Content Panel */}
                <div className="payment-method-content">
                    {/* 1. CREDIT/DEBIT CARD */}
                    {selectedMethod === "CARD" && (
                        <div className="method-panel">
                            <h4>Pay with Credit or Debit Card</h4>

                            {paymentIntent.mockMode && (
                                <div className="stripe-simulation-notice">
                                    <div className="notice-content">
                                        <strong>Stripe Card Simulation Mode</strong>
                                        <span>Click autofill to populate standard test card details.</span>
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
                                                borderRadius: "6px",
                                            },
                                        },
                                    }}
                                >
                                    <StripeElementsForm
                                        amount={paymentIntent.amount}
                                        currency={paymentIntent.currency}
                                        onSuccess={(stripeId) => processPaymentConfirmation("CARD", stripeId)}
                                        onError={(msg) => setErrorMessage(msg)}
                                    />
                                </Elements>
                            ) : (
                                <form onSubmit={handleCardSubmit} className="stripe-card-form">
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
                                                <span className="card-icon">RuPay</span>
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
                                                <span className="spinner"></span> Authorizing Card...
                                            </span>
                                        ) : (
                                            `Pay ${currencySymbol}${paymentIntent.amount.toFixed(2)} with Card`
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* 2. UPI */}
                    {selectedMethod === "UPI" && (
                        <div className="method-panel">
                            <h4>Instant UPI Payment</h4>

                            <div className="upi-type-toggle">
                                <button
                                    type="button"
                                    className={`upi-tab ${upiOption === "qr" ? "active" : ""}`}
                                    onClick={() => setUpiOption("qr")}
                                >
                                    📷 Scan QR Code
                                </button>
                                <button
                                    type="button"
                                    className={`upi-tab ${upiOption === "id" ? "active" : ""}`}
                                    onClick={() => setUpiOption("id")}
                                >
                                    @ Enter UPI ID
                                </button>
                            </div>

                            {upiOption === "qr" ? (
                                <div className="upi-qr-section">
                                    <div className="upi-qr-card">
                                        {/* Dynamic SVG QR mockup */}
                                        <div className="qr-box">
                                            <svg width="180" height="180" viewBox="0 0 180 180" fill="#111827">
                                                {/* Corner 1 */}
                                                <rect x="15" y="15" width="45" height="45" rx="4" fill="#000" />
                                                <rect x="23" y="23" width="29" height="29" fill="#fff" />
                                                <rect x="29" y="29" width="17" height="17" fill="#000" />
                                                {/* Corner 2 */}
                                                <rect x="120" y="15" width="45" height="45" rx="4" fill="#000" />
                                                <rect x="128" y="23" width="29" height="29" fill="#fff" />
                                                <rect x="134" y="29" width="17" height="17" fill="#000" />
                                                {/* Corner 3 */}
                                                <rect x="15" y="120" width="45" height="45" rx="4" fill="#000" />
                                                <rect x="23" y="128" width="29" height="29" fill="#fff" />
                                                <rect x="29" y="134" width="17" height="17" fill="#000" />
                                                {/* Matrix Dots */}
                                                <rect x="70" y="20" width="12" height="12" />
                                                <rect x="90" y="20" width="12" height="12" />
                                                <rect x="70" y="45" width="15" height="15" />
                                                <rect x="95" y="45" width="10" height="10" />
                                                <rect x="20" y="75" width="15" height="15" />
                                                <rect x="45" y="75" width="20" height="10" />
                                                <rect x="75" y="75" width="30" height="30" fill="#ff9900" />
                                                <rect x="115" y="75" width="15" height="15" />
                                                <rect x="140" y="75" width="20" height="15" />
                                                <rect x="20" y="100" width="15" height="10" />
                                                <rect x="45" y="95" width="15" height="15" />
                                                <rect x="115" y="100" width="25" height="10" />
                                                <rect x="70" y="115" width="15" height="15" />
                                                <rect x="95" y="120" width="15" height="15" />
                                                <rect x="120" y="120" width="45" height="45" rx="4" fill="#000" />
                                                <rect x="128" y="128" width="29" height="29" fill="#fff" />
                                                <rect x="134" y="134" width="17" height="17" fill="#000" />
                                            </svg>
                                        </div>
                                        <div className="qr-meta">
                                            <span className="qr-badge">UPI Dynamic QR</span>
                                            <p>Scan with any UPI App (GPay, PhonePe, Paytm, CRED)</p>
                                            <div className="upi-app-badges">
                                                <span className="app-pill gpay">GPay</span>
                                                <span className="app-pill phonepe">PhonePe</span>
                                                <span className="app-pill paytm">Paytm</span>
                                                <span className="app-pill bhim">BHIM</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleUpiSubmit}
                                        disabled={isProcessing}
                                        className="stripe-pay-btn"
                                        style={{ marginTop: "16px" }}
                                    >
                                        {isProcessing ? (
                                            <span className="btn-spinner-content">
                                                <span className="spinner"></span> Waiting for QR Scan Approval...
                                            </span>
                                        ) : (
                                            `I have Scanned & Paid ${currencySymbol}${paymentIntent.amount.toFixed(2)}`
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleUpiSubmit} className="upi-id-form">
                                    <div className="form-group">
                                        <label>Virtual Payment Address (UPI ID)</label>
                                        <div className="upi-input-group">
                                            <input
                                                type="text"
                                                placeholder="mobilenumber@upi or name@okaxis"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="upi-handles">
                                            <span>Quick handles:</span>
                                            {["@okhdfcbank", "@okaxis", "@ybl", "@paytm"].map((handle) => (
                                                <button
                                                    key={handle}
                                                    type="button"
                                                    className="handle-tag"
                                                    onClick={() => {
                                                        const prefix = upiId.split("@")[0] || "user";
                                                        setUpiId(prefix + handle);
                                                    }}
                                                >
                                                    {handle}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="stripe-pay-btn"
                                    >
                                        {isProcessing ? (
                                            <span className="btn-spinner-content">
                                                <span className="spinner"></span> Verifying UPI Payment...
                                            </span>
                                        ) : (
                                            `Verify & Pay ${currencySymbol}${paymentIntent.amount.toFixed(2)}`
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* 3. NET BANKING */}
                    {selectedMethod === "NETBANKING" && (
                        <div className="method-panel">
                            <h4>Select Your Bank</h4>
                            <p className="panel-subtext">Choose your bank to initiate a secure Net Banking transaction.</p>

                            <div className="bank-grid">
                                {[
                                    { id: "HDFC", name: "HDFC Bank", logo: "🏦 HDFC" },
                                    { id: "SBI", name: "State Bank of India", logo: "🏛️ SBI" },
                                    { id: "ICICI", name: "ICICI Bank", logo: "🏦 ICICI" },
                                    { id: "AXIS", name: "Axis Bank", logo: "🏛️ Axis" },
                                    { id: "KOTAK", name: "Kotak Mahindra", logo: "🏦 Kotak" },
                                    { id: "PNB", name: "Punjab National", logo: "🏛️ PNB" },
                                ].map((b) => (
                                    <label
                                        key={b.id}
                                        className={`bank-card ${selectedBank === b.id ? "selected" : ""}`}
                                    >
                                        <input
                                            type="radio"
                                            name="bank"
                                            value={b.id}
                                            checked={selectedBank === b.id}
                                            onChange={() => setSelectedBank(b.id)}
                                        />
                                        <span className="bank-logo">{b.logo}</span>
                                        <span className="bank-name">{b.name}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="form-group" style={{ marginTop: "16px" }}>
                                <label>Or choose another bank</label>
                                <select
                                    value={selectedBank}
                                    onChange={(e) => setSelectedBank(e.target.value)}
                                    className="bank-select"
                                >
                                    <option value="HDFC">HDFC Bank</option>
                                    <option value="SBI">State Bank of India</option>
                                    <option value="ICICI">ICICI Bank</option>
                                    <option value="AXIS">Axis Bank</option>
                                    <option value="KOTAK">Kotak Mahindra Bank</option>
                                    <option value="PNB">Punjab National Bank</option>
                                    <option value="BOB">Bank of Baroda</option>
                                    <option value="CANARA">Canara Bank</option>
                                    <option value="UNION">Union Bank of India</option>
                                    <option value="INDUSIND">IndusInd Bank</option>
                                    <option value="YES">Yes Bank</option>
                                    <option value="IDFC">IDFC First Bank</option>
                                    <option value="FEDERAL">Federal Bank</option>
                                </select>
                            </div>

                            <form onSubmit={handleNetBankingSubmit}>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="stripe-pay-btn"
                                >
                                    {isProcessing ? (
                                        <span className="btn-spinner-content">
                                            <span className="spinner"></span> Connecting to {selectedBank} NetBanking...
                                        </span>
                                    ) : (
                                        `Proceed to ${selectedBank} NetBanking →`
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* 4. PAYPAL */}
                    {selectedMethod === "PAYPAL" && (
                        <div className="method-panel paypal-panel">
                            <h4>Pay with PayPal</h4>
                            <p className="panel-subtext">
                                Safe and easy payment worldwide. You can complete payment using your PayPal account balance or linked cards.
                            </p>

                            <div className="paypal-card-box">
                                <div className="paypal-logo-badge">
                                    <span style={{ fontSize: "28px" }}>🅿️</span>
                                    <span style={{ fontWeight: 800, fontSize: "20px", color: "#003087" }}>
                                        Pay<span style={{ color: "#0079C1" }}>Pal</span>
                                    </span>
                                </div>
                                <div className="paypal-security-note">
                                    ✓ Buyer Protection Included
                                    <br />
                                    ✓ Instant order confirmation
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePayPalSubmit}
                                disabled={isProcessing}
                                className="paypal-btn"
                            >
                                {isProcessing ? (
                                    <span className="btn-spinner-content">
                                        <span className="spinner"></span> Authorizing with PayPal...
                                    </span>
                                ) : (
                                    `Pay ${currencySymbol}${paymentIntent.amount.toFixed(2)} with PayPal`
                                )}
                            </button>
                        </div>
                    )}

                    {/* 5. CASH ON DELIVERY */}
                    {selectedMethod === "COD" && (
                        <div className="method-panel cod-panel">
                            <h4>Cash on Delivery (COD)</h4>
                            <p className="panel-subtext">
                                Pay with cash or UPI scan at the time of delivery to your address.
                            </p>

                            <div className="cod-info-box">
                                <div className="cod-item">
                                    <span className="cod-icon">🚚</span>
                                    <div>
                                        <strong>No advance payment required</strong>
                                        <p>You only pay when the package is handed over to you.</p>
                                    </div>
                                </div>
                                <div className="cod-item">
                                    <span className="cod-icon">💵</span>
                                    <div>
                                        <strong>Cash / UPI Accepted</strong>
                                        <p>Delivery agents carry change and a digital UPI QR scanner.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleCodSubmit}
                                disabled={isProcessing}
                                className="stripe-pay-btn cod-confirm-btn"
                            >
                                {isProcessing ? (
                                    <span className="btn-spinner-content">
                                        <span className="spinner"></span> Placing COD Order...
                                    </span>
                                ) : (
                                    `Place Order with Cash on Delivery (₹${paymentIntent.amount.toFixed(2)})`
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer with Back button */}
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
                    🔒 Guaranteed Safe & Verified Multi-Channel Payment Gateway
                </div>
            </div>
        </div>
    );
}
