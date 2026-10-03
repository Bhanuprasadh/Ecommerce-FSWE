export type PaymentMethodType = "CARD" | "UPI" | "NETBANKING" | "PAYPAL" | "COD";

export interface PaymentIntentResponse {
    clientSecret: string;
    publishableKey: string;
    orderId: number;
    amount: number;
    currency: string;
    mockMode: boolean;
    paymentMethod: PaymentMethodType;
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    totalAmount: number;
    currency: string;
    paymentIntentId: string;
    clientSecret: string;
    status: string;
    paymentMethod?: string;
    transactionRef?: string;
    createdAt: string;
    items?: OrderItem[];
}
