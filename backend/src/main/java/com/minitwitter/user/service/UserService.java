package com.minitwitter.user.service;

import com.minitwitter.common.AuthUtils;
import com.minitwitter.exception.ResourceNotFoundException;
import com.minitwitter.social.repository.FollowRepository;
import com.minitwitter.user.dto.UpdateProfileRequest;
import com.minitwitter.user.dto.UserDTO;
import com.minitwitter.user.entity.User;
import com.minitwitter.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final AuthUtils authUtils;

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Long currentUserId = authUtils.getCurrentUserId();
        return mapToDTO(user, currentUserId);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Long currentUserId = authUtils.getCurrentUserId();
        return mapToDTO(user, currentUserId);
    }

    @Transactional
    public UserDTO updateProfile(UpdateProfileRequest request) {
        User user = authUtils.getCurrentUser();
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        user = userRepository.save(user);
        return mapToDTO(user, user.getId());
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsers(String query, Pageable pageable) {
        Long currentUserId = authUtils.getCurrentUserId();
        return userRepository.searchUsers(query, pageable)
                .map(u -> mapToDTO(u, currentUserId));
    }

    public UserDTO mapToDTO(User user, Long currentUserId) {
        long followersCount = followRepository.countByFollowingId(user.getId());
        long followingCount = followRepository.countByFollowerId(user.getId());
        boolean isFollowed = currentUserId != null &&
                followRepository.existsByFollowerIdAndFollowingId(currentUserId, user.getId());

        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .followersCount(followersCount)
                .followingCount(followingCount)
                .isFollowedByCurrentUser(isFollowed)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
