-- ------------------------------
-- PostgreSQL Seed Data for Checky
-- ------------------------------

-- Users
INSERT INTO users (firstName, lastName, email, password, role) VALUES
('John', 'Doe', 'john.doe@example.com', 'hashedpassword1', 'student'),
('Jane', 'Doe', 'jane.smith@example.com', 'hashedpassword2', 'student'),
('Alan', 'Turing', 'alan.turing@example.com', 'hashedpassword3', 'teacher'),
('Grace', 'Hopper', 'grace.hopper@example.com', 'hashedpassword4', 'teacher'),
('Sandy', 'Daisy', 'sandy@gmail.com', '$2b$10$ycB8iU66PW0zQgZBpNRHHOba.Afy6KFKtoZa1QA7NG42aIzBQDa0G', 'student'),
('Sandy', 'Daisy', 'daisy@gmail.com', '$2b$10$sWifB9q.XOsEIo4hadHTleUBnzEPbX5BNFHZJvKfjGkdD1TKwy8HS', 'teacher');

-- Classes
INSERT INTO classes (name, description, classCode, teacherID) VALUES
('Introduction to Literature', 'Exploration of literary themes, genres, and critical approaches', 'LIT101', 3),
('Advanced Academic Writing', 'Deep dive into academic writing and research methodologies', 'ENG201', 3),
('Historical Investigation Fundamentals', 'Introduction to historical research methods and sources', 'HIS101', 4),
('Religious Studies 101', 'Introduction to major world religions and their impacts on society', 'REL101', 4);

-- Class Members
INSERT INTO classMembers (classID, studentID) VALUES
(1, 1),
(1, 2),
(2, 1),
(3, 2);

-- Rubrics
INSERT INTO rubrics (name, teacherID) VALUES
('Writing Rubric', 3),
('Research Rubric', 4);

-- Rubric Criteria
INSERT INTO rubric_criteria (rubric_id, title) VALUES
(1, 'Correctness'),
(1, 'Structure'),
(2, 'Research Depth'),
(2, 'Citation Quality');

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

-- Assignments
INSERT INTO assignments (class_id, title, description, deadline, rubric_id) VALUES
(1, 'Essay on Modern Poetry', 'Write a 500-word essay analyzing a modern poem.', '2025-11-15 23:59:59', 1),
(2, 'Final Project Proposal', 'Submit a one-page proposal for your final project.', '2025-12-01 23:59:59', 1),
(3, 'Historical Sources Review', 'Analyze three primary sources from the 18th century.', '2025-10-30 23:59:59', 2),
(4, 'Religion Reflection Paper', 'Reflect on a major world religion and its social impact.', '2025-11-05 23:59:59', 2);


