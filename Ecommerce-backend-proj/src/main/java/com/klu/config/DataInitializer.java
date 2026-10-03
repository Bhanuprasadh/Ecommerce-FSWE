package com.klu.config;

import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.klu.model.Product;
import com.klu.repository.ProductRepository;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initProducts(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                logger.info("Database has no products. Seeding default product catalog...");

                List<Product> defaultProducts = Arrays.asList(
                    new Product(null, "Smart Watch", "Electronics", "Fitness and notification smart watch with health tracking", 2499.0, 12, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", 4.4, "IN_STOCK"),
                    new Product(null, "Wireless Earbuds", "Electronics", "Compact wireless earbuds with deep bass and charging case", 1799.0, 15, "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500", 4.5, "IN_STOCK"),
                    new Product(null, "Running Shoes", "Footwear", "Comfortable ergonomic shoes for running and exercise", 2299.0, 10, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", 4.3, "IN_STOCK"),
                    new Product(null, "Backpack", "Accessories", "Durable water-resistant backpack for college and travel", 1599.0, 18, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", 4.4, "IN_STOCK"),
                    new Product(null, "Apple iPhone 15 Pro", "Electronics", "128GB, Natural Titanium with dynamic island and A17 Pro chip", 119900.0, 9, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500", 4.8, "IN_STOCK"),
                    new Product(null, "Sony WH-1000XM5 Wireless Headphones", "Electronics", "Industry-leading noise cancellation with 30-hour battery life", 29990.0, 14, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", 4.7, "IN_STOCK"),
                    new Product(null, "RGB Mechanical Gaming Keyboard", "Electronics", "Customizable RGB backlit keyboard with tactile brown switches", 3499.0, 22, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500", 4.6, "IN_STOCK"),
                    new Product(null, "Espresso Coffee Machine", "Home & Kitchen", "15-bar professional pump coffee maker with milk frother wand", 8999.0, 11, "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500", 4.5, "IN_STOCK"),
                    new Product(null, "Modern LED Desk Lamp", "Home & Kitchen", "Touch control with 5 brightness levels & USB charging port", 1499.0, 35, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500", 4.4, "IN_STOCK"),
                    new Product(null, "Ceramic Non-Stick Cookware Set", "Home & Kitchen", "3-piece scratch-resistant frying pans suitable for all stove tops", 3299.0, 17, "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500", 4.6, "IN_STOCK"),
                    new Product(null, "Nike Air Max Running Shoes", "Footwear", "Lightweight athletic running shoes with responsive air cushioning", 6995.0, 12, "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500", 4.7, "IN_STOCK"),
                    new Product(null, "Polarized Aviator Sunglasses", "Accessories", "UV400 protection with lightweight classic metal frame", 1199.0, 40, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500", 4.3, "IN_STOCK"),
                    new Product(null, "Premium Leather Journal", "Stationery", "Handcrafted leather cover with 200 unlined archival quality pages", 799.0, 50, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500", 4.8, "IN_STOCK"),
                    new Product(null, "Insulated Stainless Steel Bottle", "Sports & Fitness", "1 Litre double-wall vacuum insulated keeps drinks cold for 24 hours", 899.0, 28, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500", 4.6, "IN_STOCK"),
                    new Product(null, "Ultra-HD 4K Webcam", "Electronics", "Streaming webcam with dual microphones, auto-focus, and privacy shutter", 4599.0, 20, "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500", 4.7, "IN_STOCK"),
                    new Product(null, "Ergonomic Memory Foam Pillow", "Home & Kitchen", "Contoured orthopedic cervical pillow for neck and shoulder pain relief", 1899.0, 30, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500", 4.5, "IN_STOCK"),
                    new Product(null, "Leather Minimalist Bifold Wallet", "Accessories", "Genuine top-grain leather slim wallet with RFID blocking technology", 1299.0, 45, "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500", 4.6, "IN_STOCK"),
                    new Product(null, "Yoga Mat with Carrying Strap", "Sports & Fitness", "Non-slip 6mm high-density eco-friendly TPE exercise mat", 1399.0, 35, "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500", 4.7, "IN_STOCK")
                );

                productRepository.saveAll(defaultProducts);
                logger.info("Successfully seeded {} products into PostgreSQL.", defaultProducts.size());
            }
        };
    }
}
