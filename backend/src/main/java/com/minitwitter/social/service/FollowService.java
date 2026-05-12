package com.minitwitter.social.service;

import com.minitwitter.common.AuthUtils;
import com.minitwitter.events.model.UserFollowedEvent;
import com.minitwitter.events.publisher.EventPublisher;
import com.minitwitter.exception.ConflictException;
import com.minitwitter.exception.ResourceNotFoundException;
import com.minitwitter.social.entity.Follow;
import com.minitwitter.social.repository.FollowRepository;
import com.minitwitter.user.dto.UserDTO;
import com.minitwitter.user.entity.User;
import com.minitwitter.user.repository.UserRepository;
import com.minitwitter.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuthUtils authUtils;
    private final EventPublisher eventPublisher;

    @Transactional
    public void follow(Long targetUserId) {
        User currentUser = authUtils.getCurrentUser();
        if (currentUser.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUserId));

        if (followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), targetUserId)) {
            throw new ConflictException("Already following this user");
        }

        Follow follow = Follow.builder()
                .follower(currentUser)
                .following(targetUser)
                .build();

        followRepository.save(follow);

        eventPublisher.publishUserFollowed(UserFollowedEvent.builder()
                .followerId(currentUser.getId())
                .followingId(targetUserId)
                .followed(true)
                .build());
    }

    @Transactional
    public void unfollow(Long targetUserId) {
        User currentUser = authUtils.getCurrentUser();
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUserId));

        Follow follow = followRepository.findByFollowerAndFollowing(currentUser, targetUser)
                .orElseThrow(() -> new ResourceNotFoundException("Not following this user"));

        followRepository.delete(follow);

        eventPublisher.publishUserFollowed(UserFollowedEvent.builder()
                .followerId(currentUser.getId())
                .followingId(targetUserId)
                .followed(false)
                .build());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getFollowers(Long userId) {
        Long currentUserId = authUtils.getCurrentUserId();
        return followRepository.findFollowersByUserId(userId).stream()
                .map(u -> userService.mapToDTO(u, currentUserId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getFollowing(Long userId) {
        Long currentUserId = authUtils.getCurrentUserId();
        return followRepository.findFollowingByUserId(userId).stream()
                .map(u -> userService.mapToDTO(u, currentUserId))
                .toList();
    }
}
