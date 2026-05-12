package com.minitwitter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MiniTwitterApplication {
    public static void main(String[] args) {
        SpringApplication.run(MiniTwitterApplication.class, args);
    }
}
