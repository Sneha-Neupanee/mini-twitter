package com.minitwitter.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePostRequest {

    @NotBlank(message = "Content is required")
    @Size(max = 280, message = "Post cannot exceed 280 characters")
    private String content;
}
