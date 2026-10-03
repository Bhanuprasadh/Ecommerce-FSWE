package com.klu.service;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.klu.dto.PaymentDTOs.CartItemDto;
import com.klu.dto.PaymentDTOs.ConfirmOrderRequest;
import com.klu.dto.PaymentDTOs.CreatePaymentRequest;
import com.klu.dto.PaymentDTOs.PaymentIntentResponse;
import com.klu.model.Order;
import com.klu.model.OrderItem;
import com.klu.model.Product;
import com.klu.repository.OrderRepository;
import com.klu.repository.ProductRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import jakarta.annotation.PostConstruct;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Value("${stripe.api.secret-key}")
    private String secretKey;

    @Value("${stripe.api.publishable-key}")
    private String publishableKey;

    @Value("${stripe.currency:usd}")
    private String currency;

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public PaymentService(ProductRepository productRepository, OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @PostConstruct
    public void init() {
        if (isRealStripeKey(secretKey)) {
            Stripe.apiKey = secretKey;
            logger.info("Stripe API initialized with configured secret key.");
        } else {
            logger.warn("Stripe secret key is not configured or using placeholder. Running in test simulation mode.");
        }
    }

    private boolean isRealStripeKey(String key) {
        return key != null && !key.isBlank() && !key.contains("MockKeyOrYourSecretKeyHere") && (key.startsWith("sk_test_") || key.startsWith("sk_live_"));
    }

    @Transactional
    public PaymentIntentResponse createPaymentIntent(CreatePaymentRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty");
        }

        // Calculate total amount securely using database prices
        double total = 0.0;
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setCurrency(currency.toUpperCase());

        String paymentMethod = request.getPaymentMethod();
        order.setPaymentMethod(paymentMethod);

        for (CartItemDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + itemDto.getProductId()));

            int qty = (itemDto.getQuantity() != null && itemDto.getQuantity() > 0) ? itemDto.getQuantity() : 1;
            double itemTotal = product.getPrice() * qty;
            total += itemTotal;

            OrderItem orderItem = new OrderItem(
                    product.getProductId(),
                    product.getProductName(),
                    product.getPrice(),
                    qty,
                    order
            );
            order.addItem(orderItem);
        }

        order.setTotalAmount(total);

        String paymentIntentId;
        String clientSecret;
        boolean mockMode = !isRealStripeKey(secretKey);

        if ("COD".equalsIgnoreCase(paymentMethod)) {
            paymentIntentId = "cod_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            clientSecret = paymentIntentId + "_token";
            order.setStatus("PENDING");
            mockMode = true;
        } else if ("UPI".equalsIgnoreCase(paymentMethod)) {
            paymentIntentId = "upi_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            clientSecret = paymentIntentId + "_token";
            order.setStatus("PENDING");
            mockMode = true;
        } else if ("NETBANKING".equalsIgnoreCase(paymentMethod)) {
            paymentIntentId = "nb_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            clientSecret = paymentIntentId + "_token";
            order.setStatus("PENDING");
            mockMode = true;
        } else if ("PAYPAL".equalsIgnoreCase(paymentMethod)) {
            paymentIntentId = "paypal_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            clientSecret = paymentIntentId + "_token";
            order.setStatus("PENDING");
            mockMode = true;
        } else {
            // Default: Credit/Debit Card (Stripe)
            order.setStatus("PENDING");
            if (!mockMode) {
                try {
                    long amountInCents = Math.round(total * 100);
                    PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                            .setAmount(amountInCents)
                            .setCurrency(currency.toLowerCase())
                            .setAutomaticPaymentMethods(
                                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                            )
                            .putMetadata("customer_email", request.getCustomerEmail() != null ? request.getCustomerEmail() : "")
                            .build();

                    PaymentIntent intent = PaymentIntent.create(params);
                    paymentIntentId = intent.getId();
                    clientSecret = intent.getClientSecret();
                } catch (StripeException e) {
                    logger.warn("Stripe API call failed ({}). Falling back to simulation mode.", e.getMessage());
                    mockMode = true;
                    paymentIntentId = "pi_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
                    clientSecret = paymentIntentId + "_secret_mock";
                }
            } else {
                paymentIntentId = "pi_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
                clientSecret = paymentIntentId + "_secret_mock";
            }
        }

        order.setPaymentIntentId(paymentIntentId);
        order.setClientSecret(clientSecret);
        Order savedOrder = orderRepository.save(order);

        return new PaymentIntentResponse(
                clientSecret,
                publishableKey,
                savedOrder.getId(),
                total,
                currency.toUpperCase(),
                mockMode,
                paymentMethod
        );
    }

    @Transactional
    public Order confirmOrder(ConfirmOrderRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + request.getOrderId()));

        String method = request.getPaymentMethod() != null ? request.getPaymentMethod() : order.getPaymentMethod();
        if (method == null) method = "CARD";
        order.setPaymentMethod(method);

        String txnRef = request.getTransactionRef();

        if ("COD".equalsIgnoreCase(method)) {
            order.setStatus("CONFIRMED (CASH ON DELIVERY)");
            order.setTransactionRef(txnRef != null ? txnRef : "COD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        } else if ("UPI".equalsIgnoreCase(method)) {
            order.setStatus("PAID");
            order.setTransactionRef(txnRef != null ? txnRef : "UPI-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        } else if ("NETBANKING".equalsIgnoreCase(method)) {
            order.setStatus("PAID");
            order.setTransactionRef(txnRef != null ? txnRef : "NB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        } else if ("PAYPAL".equalsIgnoreCase(method)) {
            order.setStatus("PAID");
            order.setTransactionRef(txnRef != null ? txnRef : "PAYPAL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        } else {
            // CARD
            if (isRealStripeKey(secretKey) && request.getPaymentIntentId() != null && !request.getPaymentIntentId().startsWith("pi_mock_")) {
                try {
                    PaymentIntent intent = PaymentIntent.retrieve(request.getPaymentIntentId());
                    if ("succeeded".equalsIgnoreCase(intent.getStatus())) {
                        order.setStatus("PAID");
                        order.setTransactionRef(intent.getId());
                    } else {
                        order.setStatus("FAILED: " + intent.getStatus());
                    }
                } catch (StripeException e) {
                    logger.error("Error verifying payment intent from Stripe: {}", e.getMessage());
                    order.setStatus("FAILED");
                }
            } else {
                // Simulated / Mock confirmation
                order.setStatus("PAID");
                order.setTransactionRef(txnRef != null ? txnRef : "CARD-TEST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            }
        }

        return orderRepository.save(order);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
    }
}
