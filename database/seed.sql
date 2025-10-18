USE checkydb;

-- Users
INSERT INTO users (first_name, last_name, email, password, role) VALUES
('John', 'Doe', 'john.doe@example.com', 'hashedpassword1', 'student'),
('Jane', 'Smith', 'jane.smith@example.com', 'hashedpassword2', 'student'),
('Alan', 'Turing', 'alan.turing@example.com', 'hashedpassword3', 'teacher'),
('Grace', 'Hopper', 'grace.hopper@example.com', 'hashedpassword4', 'teacher');

-- Classes
INSERT INTO classes (name, description, class_code, teacher_id) VALUES
('Technical English 1', 'A beginner course for programming.', 'CS101-FALL25', 3),
('Advanced Data Structures', 'Intermediate data structures course.', 'CS201-FALL25', 4);

-- Class Members
INSERT INTO class_members (class_id, student_id) VALUES
(1, 1),
(1, 2),
(2, 1);

-- Rubrics
INSERT INTO rubrics (name, teacher_id) VALUES
('Writing Rubric', 3),
('Coding Rubric', 4);

-- Rubric Criteria
INSERT INTO rubric_criteria (rubric_id, title) VALUES
(1, 'Correctness'),
(1, 'Clarity'),
(2, 'Algorithm'),
(2, 'Efficiency');

-- Rubric Levels
INSERT INTO rubric_levels (criterion_id, level_name, score, description) VALUES
(1, 'High', 10, 'Perfect writing'),
(1, 'Medium', 5, '1-3 mistakes'),
(1, 'Low', 2, '>5 mistakes'),
(2, 'High', 10, 'Very clear'),
(2, 'Medium', 6, 'Somewhat clear'),
(2, 'Low', 3, 'Not clear'),
(3, 'High', 10, 'Optimal algorithm'),
(3, 'Medium', 6, 'Acceptable algorithm'),
(3, 'Low', 3, 'Incorrect algorithm'),
(4, 'High', 10, 'Very efficient code'),
(4, 'Medium', 6, 'Moderately efficient'),
(4, 'Low', 3, 'Inefficient code');

-- Assignments
INSERT INTO assignments (class_id, title, description, deadline, rubric_id) VALUES
(1, 'Essay 1', 'Write an essay on AI impact.', '2025-10-25 23:59:59', 1),
(1, 'Essay 2', 'Comparative Analysis of texts.', '2025-10-28 23:59:59', 1),
(2, 'Lab 1: Linked Lists', 'Implement linked list operations.', '2025-10-25 23:59:59', 2);

-- Submissions
INSERT INTO submissions (assignment_id, student_id, content, attachments, submitted_at, score, teacher_comment) VALUES
(1, 1, 'Essay content by John', '["https://example.com/essay1.pdf"]', '2025-10-24 18:30:00', 95, 'Excellent work!'),
(1, 2, 'Essay content by Jane', '["https://example.com/essay1_jane.pdf"]', '2025-10-24 20:00:00', 90, 'Good effort!'),
(2, 1, 'Essay 2 content by John', '[]', '2025-10-27 12:00:00', NULL, NULL);

-- Peer Reviews
INSERT INTO peer_reviews (submission_id, reviewer_id, comments, status, review_deadline) VALUES
(2, 1, 'The introduction is strong, conclusion can improve.', 'COMPLETED', '2025-10-28 23:59:59');

-- Notifications
INSERT INTO notifications (user_id, type, message, link, is_read) VALUES
(1, 'GRADE_RELEASED', 'อาจารย์ได้ให้คะแนนงาน Essay 1 ของคุณแล้ว', '/class/1/assignment/1', FALSE),
(1, 'NEW_COMMENT', 'อาจารย์ได้แสดงความคิดเห็นในงาน Essay 1 ของคุณ', '/class/1/assignment/1', FALSE),
(1, 'PEER_REVIEW_ASSIGNED', 'คุณได้รับมอบหมายให้รีวิวงานของเพื่อนใน Essay 2', '/peer-reviews', FALSE),
(2, 'NEW_ASSIGNMENT', 'มีงานใหม่: Essay 3 ในคลาส Technical English 1', '/class/1/assignment/3', FALSE);
