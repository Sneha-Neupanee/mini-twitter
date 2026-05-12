package com.minitwitter.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String bio;
    private String avatarUrl;
    private long followersCount;
    private long followingCount;
    private boolean isFollowedByCurrentUser;
    private LocalDateTime createdAt;
}
