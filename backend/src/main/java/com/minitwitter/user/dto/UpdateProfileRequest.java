package com.minitwitter.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 300, message = "Bio cannot exceed 300 characters")
    private String bio;

    private String avatarUrl;
}
