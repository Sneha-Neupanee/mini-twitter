package com.minitwitter.social.controller;

import com.minitwitter.social.service.FollowService;
import com.minitwitter.user.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{id}/follow")
    public ResponseEntity<Void> follow(@PathVariable Long id) {
        followService.follow(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/unfollow")
    public ResponseEntity<Void> unfollow(@PathVariable Long id) {
        followService.unfollow(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<List<UserDTO>> getFollowers(@PathVariable Long id) {
        return ResponseEntity.ok(followService.getFollowers(id));
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<List<UserDTO>> getFollowing(@PathVariable Long id) {
        return ResponseEntity.ok(followService.getFollowing(id));
    }
}
