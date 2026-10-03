package com.klu.ecommercebackend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.klu.ecommercebackend.model.Product;
import com.klu.ecommercebackend.repository.ProductRepository;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long productId) {
        Optional<Product> product = productRepository.findById(productId);
        return product.orElse(null);
    }
}
