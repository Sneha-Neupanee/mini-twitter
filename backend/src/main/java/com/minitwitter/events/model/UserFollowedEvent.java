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
public class UserFollowedEvent implements Serializable {
    private Long followerId;
    private Long followingId;
    private boolean followed;
}
