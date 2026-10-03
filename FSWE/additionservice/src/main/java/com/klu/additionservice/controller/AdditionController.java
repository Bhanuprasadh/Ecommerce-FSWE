package com.klu.additionservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdditionController {

    @GetMapping("/add")
    public String add(@RequestParam int a, @RequestParam int b) {
        int result = a + b;
        return "Addition = " + result;
    }
}