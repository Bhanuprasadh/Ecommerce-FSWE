import axios from "./axiosConfig";
import type { Order, PaymentIntentResponse, PaymentMethodType } from "../types/payment";

const BASE_URL = "http://localhost:8080/api/payment";

export interface CreatePaymentPayload {
    items: { productId: number; quantity: number }[];
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    paymentMethod?: PaymentMethodType;
}

export const paymentApi = {
    createPaymentIntent: async (payload: CreatePaymentPayload): Promise<PaymentIntentResponse> => {
        const response = await axios.post<PaymentIntentResponse>(`${BASE_URL}/create-payment-intent`, payload);
        return response.data;
    },

    confirmOrder: async (
        orderId: number,
        paymentIntentId: string,
        paymentMethod?: PaymentMethodType,
        transactionRef?: string
    ): Promise<Order> => {
        const response = await axios.post<Order>(`${BASE_URL}/confirm-order`, {
            orderId,
            paymentIntentId,
            paymentMethod,
            transactionRef,
        });
        return response.data;
    },

    getOrderById: async (orderId: number): Promise<Order> => {
        const response = await axios.get<Order>(`${BASE_URL}/order/${orderId}`);
        return response.data;
    }
};
