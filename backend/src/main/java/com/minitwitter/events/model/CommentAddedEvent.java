package com.minitwitter.events.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentAddedEvent implements Serializable {
    private Long postId;
    private Long commentId;
    private Long userId;
    private String text;
}
