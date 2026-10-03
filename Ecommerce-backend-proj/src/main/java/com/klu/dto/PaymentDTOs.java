package com.klu.dto;

import java.util.List;

public class PaymentDTOs {

    public static class CartItemDto {
        private Long productId;
        private Integer quantity;

        public CartItemDto() {}

        public CartItemDto(Long productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    public static class CreatePaymentRequest {
        private List<CartItemDto> items;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        private String shippingAddress;
        private String paymentMethod; // CARD, UPI, NETBANKING, PAYPAL, COD

        public CreatePaymentRequest() {}

        public List<CartItemDto> getItems() {
            return items;
        }

        public void setItems(List<CartItemDto> items) {
            this.items = items;
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public String getCustomerEmail() {
            return customerEmail;
        }

        public void setCustomerEmail(String customerEmail) {
            this.customerEmail = customerEmail;
        }

        public String getCustomerPhone() {
            return customerPhone;
        }

        public void setCustomerPhone(String customerPhone) {
            this.customerPhone = customerPhone;
        }

        public String getShippingAddress() {
            return shippingAddress;
        }

        public void setShippingAddress(String shippingAddress) {
            this.shippingAddress = shippingAddress;
        }

        public String getPaymentMethod() {
            return paymentMethod != null && !paymentMethod.isBlank() ? paymentMethod : "CARD";
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }
    }

    public static class PaymentIntentResponse {
        private String clientSecret;
        private String publishableKey;
        private Long orderId;
        private Double amount;
        private String currency;
        private boolean mockMode;
        private String paymentMethod;

        public PaymentIntentResponse() {}

        public PaymentIntentResponse(String clientSecret, String publishableKey, Long orderId, Double amount, String currency, boolean mockMode, String paymentMethod) {
            this.clientSecret = clientSecret;
            this.publishableKey = publishableKey;
            this.orderId = orderId;
            this.amount = amount;
            this.currency = currency;
            this.mockMode = mockMode;
            this.paymentMethod = paymentMethod;
        }

        public String getClientSecret() {
            return clientSecret;
        }

        public void setClientSecret(String clientSecret) {
            this.clientSecret = clientSecret;
        }

        public String getPublishableKey() {
            return publishableKey;
        }

        public void setPublishableKey(String publishableKey) {
            this.publishableKey = publishableKey;
        }

        public Long getOrderId() {
            return orderId;
        }

        public void setOrderId(Long orderId) {
            this.orderId = orderId;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }

        public boolean isMockMode() {
            return mockMode;
        }

        public void setMockMode(boolean mockMode) {
            this.mockMode = mockMode;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }
    }

    public static class ConfirmOrderRequest {
        private Long orderId;
        private String paymentIntentId;
        private String paymentMethod;
        private String transactionRef;

        public ConfirmOrderRequest() {}

        public ConfirmOrderRequest(Long orderId, String paymentIntentId, String paymentMethod, String transactionRef) {
            this.orderId = orderId;
            this.paymentIntentId = paymentIntentId;
            this.paymentMethod = paymentMethod;
            this.transactionRef = transactionRef;
        }

        public Long getOrderId() {
            return orderId;
        }

        public void setOrderId(Long orderId) {
            this.orderId = orderId;
        }

        public String getPaymentIntentId() {
            return paymentIntentId;
        }

        public void setPaymentIntentId(String paymentIntentId) {
            this.paymentIntentId = paymentIntentId;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getTransactionRef() {
            return transactionRef;
        }

        public void setTransactionRef(String transactionRef) {
            this.transactionRef = transactionRef;
        }
    }
}
