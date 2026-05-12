package com.minitwitter.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private String content;
    private Long authorId;
    private String authorUsername;
    private String authorAvatarUrl;
    private long likesCount;
    private long commentsCount;
    private long repostsCount;
    private boolean likedByCurrentUser;
    private boolean repostedByCurrentUser;
    private boolean repost;
    private Long originalPostId;
    private double engagementScore;
    private LocalDateTime createdAt;
}
