package com.minitwitter.engagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank(message = "Comment text is required")
    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    private String text;
}
