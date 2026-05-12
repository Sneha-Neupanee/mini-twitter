-- Sample seed data for development
-- Run this AFTER the app has started once (tables will be created by Hibernate)

-- Note: passwords are BCrypt hashes of "password123"
INSERT INTO users (username, email, password, bio, role, created_at)
VALUES
  ('alice', 'alice@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Software engineer & coffee enthusiast ☕', 'USER', NOW()),
  ('bob', 'bob@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Building things on the internet 🚀', 'USER', NOW()),
  ('charlie', 'charlie@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Designer | Creator | Explorer 🎨', 'USER', NOW()),
  ('admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Platform administrator', 'ADMIN', NOW())
ON CONFLICT (username) DO NOTHING;

INSERT INTO posts (user_id, content, is_repost, engagement_score, created_at)
SELECT u.id, 'Just launched my new project! Really excited about this one 🚀 #buildinpublic', false, 15.0, NOW() - INTERVAL '2 hours'
FROM users u WHERE u.username = 'alice'
ON CONFLICT DO NOTHING;

INSERT INTO posts (user_id, content, is_repost, engagement_score, created_at)
SELECT u.id, 'Hot take: Clean code is not about having the fewest lines. It''s about expressing intent clearly. 🧵', false, 22.0, NOW() - INTERVAL '5 hours'
FROM users u WHERE u.username = 'bob'
ON CONFLICT DO NOTHING;

INSERT INTO posts (user_id, content, is_repost, engagement_score, created_at)
SELECT u.id, 'Design tip: White space is not empty space — it''s a design element. Use it intentionally. ✨', false, 18.0, NOW() - INTERVAL '8 hours'
FROM users u WHERE u.username = 'charlie'
ON CONFLICT DO NOTHING;
