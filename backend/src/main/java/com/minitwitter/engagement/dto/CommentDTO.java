package com.minitwitter.engagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private Long postId;
    private Long authorId;
    private String authorUsername;
    private String authorAvatarUrl;
    private String text;
    private LocalDateTime createdAt;
}
