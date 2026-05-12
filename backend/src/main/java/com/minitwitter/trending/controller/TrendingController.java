package com.minitwitter.trending.controller;

import com.minitwitter.post.dto.PostDTO;
import com.minitwitter.trending.service.TrendingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feed")
@RequiredArgsConstructor
public class TrendingController {

    private final TrendingService trendingService;

    @GetMapping("/trending")
    public ResponseEntity<Page<PostDTO>> getTrending(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(trendingService.getTrendingPosts(pageable));
    }
}
