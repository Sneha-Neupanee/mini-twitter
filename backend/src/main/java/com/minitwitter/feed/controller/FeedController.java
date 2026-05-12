package com.minitwitter.feed.controller;

import com.minitwitter.feed.service.FeedService;
import com.minitwitter.post.dto.PostDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feed")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    @GetMapping("/home")
    public ResponseEntity<Page<PostDTO>> getHomeFeed(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(feedService.getHomeFeed(pageable));
    }

    @GetMapping("/ranked")
    public ResponseEntity<Page<PostDTO>> getRankedFeed(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(feedService.getRankedFeed(pageable));
    }
}
