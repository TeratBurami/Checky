-- ------------------------------
-- PostgreSQL Seed Data for Checky
-- ------------------------------

-- Users
INSERT INTO users (firstName, lastName, email, password, role) VALUES
('John', 'Doe', 'john.doe@example.com', 'hashedpassword1', 'student'),
('Jane', 'Doe', 'jane.smith@example.com', 'hashedpassword2', 'student'),
('Alan', 'Turing', 'alan.turing@example.com', 'hashedpassword3', 'teacher'),
('Grace', 'Hopper', 'grace.hopper@example.com', 'hashedpassword4', 'teacher');

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