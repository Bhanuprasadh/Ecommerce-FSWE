package com.klu.service;
import java.util.List;
import org.springframework.stereotype.Service;
import com.klu.model.Product;
import com.klu.repository.ProductRepository;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    public ProductService(     ProductRepository productRepository   ) {
        this.productRepository = productRepository;
    }
    public Product addProduct(          Product product   ) {
        return productRepository.save(product);
    }
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    public Product getProductById(  Long productId  ) {
        return productRepository
                .findById(productId)
                .orElse(null);
    }
}
