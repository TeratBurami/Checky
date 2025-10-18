USE checkydb;

INSERT INTO users (name, email, password) VALUES
('Alice', 'alice@example.com', 'pass1'),
('Bob', 'bob@example.com', 'pass2');

INSERT INTO posts (user_id, title, content) VALUES
(1, 'Hello World', 'This is Alice''s first post.'),
(2, 'My Post', 'This is Bob''s first post.');
