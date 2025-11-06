-- ------------------------------
-- PostgreSQL Seed Data for Checky
-- ------------------------------

-- Users
-- Passwords for all users are 'password' (using bcrypt hash)
INSERT INTO users (firstName, lastName, email, password, role) VALUES
(
    'John', 
    'Doe', 
    'johndoe@gmail.com', 
    '$2b$10$sAfXqrjv9SbhsFyXJjxn/upbIhgaayLG0ah32hPbdRzFCMHBvBEhO', 
    'student' -- userID 1
),
(
    'Jane', 
    'Doe', 
    'reze@gmail.com', 
    '$2b$10$g6AgrHKhUBaRy.LmSMcNDOcYeIbev2JhTDcTLX/RPnpFIQi9lONIS', 
    'student' -- userID 2 (FOCUS USER: reze@gmail.com)
),
(
    'Alan', 
    'Turing', 
    'alan@gmail.com', 
    '$2b$10$F1s3hKOffwX7vx4WcPi1JeSQTB0NFYWX8ndwCAHwC.GuE3K.HnQeG', 
    'teacher' -- userID 3
),
(
    'Thanapon', 
    'Noraset', 
    'nornor@gmail.com', 
    '$2b$10$90ibmo1JTuZViT3GWKHUcuvrmmJ90EJpdTbzL80QIOhy56HKMCpJe', 
    'teacher' -- userID 4 (FOCUS USER: nornor@gmail.com)
),
(
    'Sandy', 
    'Daisy', 
    'sandy@gmail.com', 
    '$2b$10$ycB8iU66PW0zQgZBpNRHHOba.Afy6KFKtoZa1QA7NG42aIzBQDa0G', 
    'student' -- userID 5
),
(
    'Emily', 
    'Clark', 
    'emily@gmail.com', 
    '$2b$10$lupauJAu8HxUrxfp.3mKQOpreHM603kSWfpgtPhMIGXLkYdJhBW16', 
    'teacher' -- userID 6
);

-- Classes
INSERT INTO classes (name, description, classCode, teacherID) VALUES
('Introduction to Literature', 'Exploration of literary themes, genres, and critical approaches', 'LIT101', 3), -- Class 1 (Alan - Jane's class)
('Advanced Academic Writing', 'Deep dive into academic writing and research methodologies', 'ENG201', 3), -- Class 2 (Alan)
('Historical Investigation Fundamentals', 'Introduction to historical research methods and sources', 'HIS101', 4), -- Class 3 (Thanapon - Jane's class)
('Religious Studies 101', 'Introduction to major world religions and their impacts on society', 'REL101', 4), -- Class 4 (Thanapon)
('Suffering Engineering', 'Be more waterfall and crush all customer.', 'SUFSD666', 6); -- Class 5 (Emily)

-- Class Members
INSERT INTO classMembers (classID, studentID) VALUES
(1, 1), -- John in Class 1 (Peer for Jane)
(1, 2), -- Jane in Class 1
(1, 5), -- Sandy in Class 1 (Peer for Jane)
(2, 1), -- John in Class 2
(3, 2), -- Jane in Class 3
(3, 1), -- John in Class 3 (Peer for Jane)
(3, 5), -- Sandy in Class 3 (Peer for Jane)
(5, 5); -- Sandy in Class 5

-- Rubrics
INSERT INTO rubrics (name, teacherID) VALUES
('Writing Rubric', 3), -- Rubric 1 (Alan)
('Research Rubric', 4); -- Rubric 2 (Thanapon)

-- Rubric Criteria
INSERT INTO rubric_criteria (rubric_id, title) VALUES
(1, 'Correctness'), -- Criterion 1
(1, 'Structure'), -- Criterion 2
(2, 'Research Depth'), -- Criterion 3
(2, 'Citation Quality'); -- Criterion 4

-- Rubric Levels
INSERT INTO rubric_levels (criterion_id, level_name, score, description) VALUES
-- Writing Rubric: Correctness
(1, 'High', 10, 'Perfect writing with no grammar mistakes'),
(1, 'Medium', 5, 'Few grammar mistakes (1-3)'),
(1, 'Low', 2, 'Many grammar mistakes (>5)'),

-- Writing Rubric: Structure
(2, 'High', 10, 'Clear structure with introduction, body, conclusion'),
(2, 'Medium', 6, 'Some structure, but transitions weak'),
(2, 'Low', 3, 'Poorly organized'),

-- Research Rubric: Research Depth
(3, 'High', 10, 'Excellent use of diverse sources'),
(3, 'Medium', 6, 'Moderate use of sources'),
(3, 'Low', 3, 'Limited or no sources'),

-- Research Rubric: Citation Quality
(4, 'High', 10, 'Perfect APA citations'),
(4, 'Medium', 7, 'Minor citation errors'),
(4, 'Low', 3, 'Incorrect or missing citations');

-- Assignments (Total 8)
INSERT INTO assignments (class_id, title, description, deadline, rubric_id) VALUES
(1, 'Essay on Modern Poetry', 'Write a 500-word essay analyzing a modern poem.', '2025-11-15 23:59:59', 1), -- Assignment 1 (Class 1)
(2, 'Final Project Proposal', 'Submit a one-page proposal for your final project.', '2025-12-01 23:59:59', 1), -- Assignment 2 (Class 2)
(3, 'Historical Sources Review', 'Analyze three primary sources from the 18th century.', '2025-10-30 23:59:59', 2), -- Assignment 3 (Class 3)
(4, 'Religion Reflection Paper', 'Reflect on a major world religion and its social impact.', '2025-11-05 23:59:59', 2), -- Assignment 4 (Class 4)
(1, 'Literary Analysis of Gatsby', 'A 1000-word analysis of F. Scott Fitzgerald''s novel.', '2025-11-10 23:59:59', 1), -- Assignment 5 (Class 1, NEW)
(1, 'Poetry Annotation Draft', 'Annotate five assigned poems for initial feedback.', '2025-11-03 23:59:59', 1), -- Assignment 6 (Class 1, NEW)
(3, 'Primary Source Synthesis', 'Synthesize three distinct primary sources on the American Revolution.', '2025-11-12 23:59:59', 2), -- Assignment 7 (Class 3, NEW)
(3, 'Historical Methodology Paper', 'Critique the methodology used in a provided historical journal article.', '2025-11-05 23:59:59', 2); -- Assignment 8 (Class 3, NEW)


-- Submissions (Total 13: 2 by Jane, 11 by peers for Jane to review)
INSERT INTO submissions (assignment_id, student_id, content, submitted_at) VALUES
-- Submissions by Jane Doe (userID 2)
(3, 2, 'Jane''s submission for the Historical Sources Review.', NOW() - INTERVAL '10 days'), -- Submission 1
(1, 2, 'Jane''s draft essay analyzing T.S. Eliot''s "The Waste Land".', NOW() - INTERVAL '9 days'), -- Submission 2

-- Submissions by Peers (John and Sandy) for Jane (userID 2) to review
(1, 1, 'John''s Essay on Modern Poetry.', NOW() - INTERVAL '8 days'), -- Submission 3
(5, 1, 'John''s submission for Literary Analysis of Gatsby.', NOW() - INTERVAL '7 days'), -- Submission 4
(6, 5, 'Sandy''s Poetry Annotation Draft.', NOW() - INTERVAL '6 days'), -- Submission 5
(7, 1, 'John''s Primary Source Synthesis.', NOW() - INTERVAL '5 days'), -- Submission 6
(8, 5, 'Sandy''s Historical Methodology Paper.', NOW() - INTERVAL '4 days'), -- Submission 7
(5, 5, 'Sandy''s Literary Analysis (2nd submission).', NOW() - INTERVAL '3 days'), -- Submission 8
(1, 5, 'Sandy''s Essay on Modern Poetry (2nd submission).', NOW() - INTERVAL '2 days'), -- Submission 9
(6, 1, 'John''s Poetry Annotation Draft (2nd submission).', NOW() - INTERVAL '1 day'), -- Submission 10
(3, 1, 'John''s Historical Sources Review (2nd submission).', NOW() - INTERVAL '12 hours'), -- Submission 11
(7, 5, 'Sandy''s Primary Source Synthesis (2nd submission).', NOW() - INTERVAL '6 hours'), -- Submission 12
(8, 1, 'John''s Historical Methodology Paper (2nd submission).', NOW() - INTERVAL '3 hours'); -- Submission 13

-- Peer Reviews (Total 15: 5 PENDING for Jane, 6 COMPLETED for Jane)
INSERT INTO peer_reviews (submission_id, reviewer_id, comments, status, review_deadline, created_at) VALUES
-- --- Reviews of Jane's Submissions (for other users) ---
(2, 1, NULL, 'PENDING', '2025-11-01 23:59:59', NOW() - INTERVAL '7 days'), -- Review 1: John (1) needs to review Jane (2)
(1, 5, '[High, Medium] Sandy found Jane''s source selection strong, but suggested focusing the introduction.', 'COMPLETED', '2025-10-18 23:59:59', NOW() - INTERVAL '8 days'),

-- --- COMPLETED Reviews by Jane Doe (userID 2) (6 Total) ---
(3, 2, '[High, Medium] Excellent structure and flow! I only found one minor typo. Strong start.', 'COMPLETED', '2025-10-25 00:00:00', NOW() - INTERVAL '2 days'),
(9, 2, '[High, Low] Sandy successfully addressed the prompt, but needs to work on integrating direct quotes smoothly (Criterion 1).', 'COMPLETED', '2025-10-20 23:59:59', NOW() - INTERVAL '5 days'),
(10, 2, '[Medium, Medium] John''s annotations are detailed, though the structure needs refinement to follow the class guide (Criterion 2).', 'COMPLETED', '2025-10-21 23:59:59', NOW() - INTERVAL '4 days'),
(11, 2, '[High, High] Very comprehensive review of primary sources. All citations look perfectly formatted (Criterion 4).', 'COMPLETED', '2025-10-22 23:59:59', NOW() - INTERVAL '3 days'),
(12, 2, '[Medium, High] Sandy''s synthesis is insightful. Needs stronger transitions between historical periods, check rubric for structure scoring.', 'COMPLETED', '2025-10-23 23:59:59', NOW() - INTERVAL '2 days'),
(13, 2, '[High, Medium] John has a solid critique of the methodology. Focus on deepening the research depth analysis (Criterion 3).', 'COMPLETED', '2025-10-24 23:59:59', NOW() - INTERVAL '1 day'),
(8, 2, '[Medium, Low] Good flow, but remember to submit the final draft version, not the outline!', 'COMPLETED', '2025-10-24 12:00:00', NOW() - INTERVAL '1 day'),

-- --- PENDING Reviews by Jane Doe (userID 2) (5 Total) ---
(4, 2, NULL, 'PENDING', '2025-11-01 23:59:59', NOW() - INTERVAL '1 hour'), -- Review 4 (Pending 1: John's A5)
(5, 2, NULL, 'PENDING', '2025-11-03 23:59:59', NOW() - INTERVAL '30 minutes'), -- Review 5 (Pending 2: Sandy's A6)
(6, 2, NULL, 'PENDING', '2025-11-04 23:59:59', NOW() - INTERVAL '15 minutes'), -- Review 6 (Pending 3: John's A7)
(7, 2, NULL, 'PENDING', '2025-11-07 23:59:59', NOW() - INTERVAL '5 minutes'), -- Review 7 (Pending 4: Sandy's A8)
(1, 2, NULL, 'PENDING', '2025-11-10 23:59:59', NOW()), -- Review 15 (Pending 5: John's A1)
(1, 2, NULL, 'PENDING', '2025-11-05 23:59:59', NOW()); -- Review 16 (This is a duplicate assignment of Submission 1 (Jane's), so I will skip this.)

-- Review 15 (Pending 5) is actually not possible as Jane cannot review her own submission (Submission 1). Let me check the Submissions table again and use an available Submission ID (1 to 13). Submission 1 is Jane's, so I can't assign it to her. I'll use Submission 11 for the 5th pending review.
-- Re-inserting the PENDING reviews to ensure correct submission_id usage.
DELETE FROM peer_reviews WHERE reviewer_id = 2 AND status = 'PENDING';
INSERT INTO peer_reviews (submission_id, reviewer_id, comments, status, review_deadline, created_at) VALUES
(4, 2, NULL, 'PENDING', '2025-11-01 23:59:59', NOW() - INTERVAL '1 hour'), -- Review 15 (John's A5)
(5, 2, NULL, 'PENDING', '2025-11-03 23:59:59', NOW() - INTERVAL '30 minutes'), -- Review 16 (Sandy's A6)
(6, 2, NULL, 'PENDING', '2025-11-04 23:59:59', NOW() - INTERVAL '15 minutes'), -- Review 17 (John's A7)
(7, 2, NULL, 'PENDING', '2025-11-07 23:59:59', NOW() - INTERVAL '5 minutes'), -- Review 18 (Sandy's A8)
(11, 2, NULL, 'PENDING', '2025-11-10 23:59:59', NOW()); -- Review 19 (John's A3)

-- Notifications (Focusing on Jane (2) and Thanapon (4))
INSERT INTO notifications (user_id, type, message, link, is_read, created_at) VALUES
(
    2, -- Jane Doe (reze@gmail.com)
    'PEER_REVIEW_ASSIGNED',
    'You have been assigned 5 new peer reviews, including "Literary Analysis of Gatsby".',
    '/dashboard/reviews',
    FALSE,
    NOW() - INTERVAL '1 minute'
),
(
    2, -- Jane Doe (reze@gmail.com)
    'NEW_COMMENT',
    'A peer completed their review of your "Historical Sources Review" submission.',
    '/submission/1/peer_review/3',
    FALSE,
    NOW() - INTERVAL '1 hour'
),
(
    4, -- Thanapon Noraset (nornor@gmail.com)
    'NEW_ASSIGNMENT',
    'John Doe submitted his Historical Methodology Paper (Assignment 8) for your class.',
    '/class/3/assignment/8/submissions',
    FALSE,
    NOW() - INTERVAL '3 hours'
);
