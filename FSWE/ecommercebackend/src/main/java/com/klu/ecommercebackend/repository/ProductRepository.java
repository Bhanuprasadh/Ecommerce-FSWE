package com.klu.ecommercebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klu.ecommercebackend.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
