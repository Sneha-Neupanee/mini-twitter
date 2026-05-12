package com.minitwitter.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private Long senderId;
    private String senderUsername;
    private String senderAvatarUrl;
    private Long receiverId;
    private String receiverUsername;
    private String content;
    private boolean read;
    private LocalDateTime createdAt;
}
