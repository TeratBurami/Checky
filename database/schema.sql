-- ------------------------------
-- PostgreSQL Schema for Checky
-- ------------------------------

-- Enum Types
CREATE TYPE userRole AS ENUM ('student','teacher');
CREATE TYPE review_status AS ENUM ('PENDING','COMPLETED');
CREATE TYPE notification_type AS ENUM ('GRADE_RELEASED','NEW_COMMENT','PEER_REVIEW_ASSIGNED','NEW_ASSIGNMENT');
CREATE TYPE level_name AS ENUM ('Low','Medium','High');

-- Users table
CREATE TABLE users (
    userID SERIAL PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role userRole NOT NULL,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE classes (
    classID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    classCode VARCHAR(50) UNIQUE,
    teacherID INT NOT NULL REFERENCES users(userID) ON DELETE CASCADE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student-Class Membership
CREATE TABLE classMembers (
    classID INT NOT NULL REFERENCES classes(classID) ON DELETE CASCADE,
    studentID INT NOT NULL REFERENCES users(userID) ON DELETE CASCADE,
    joinAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (classID, studentID)
);

-- -- Rubrics
-- CREATE TABLE rubrics (
--     rubric_id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     teacher_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Rubric Criteria
-- CREATE TABLE rubric_criteria (
--     criterion_id SERIAL PRIMARY KEY,
--     rubric_id INT NOT NULL REFERENCES rubrics(rubric_id) ON DELETE CASCADE,
--     title VARCHAR(255) NOT NULL
-- );

-- -- Rubric Levels
-- CREATE TABLE rubric_levels (
--     level_id SERIAL PRIMARY KEY,
--     criterion_id INT NOT NULL REFERENCES rubric_criteria(criterion_id) ON DELETE CASCADE,
--     level_name level_name NOT NULL,
--     score INT NOT NULL,
--     description TEXT
-- );

-- -- Assignments
-- CREATE TABLE assignments (
--     assignment_id SERIAL PRIMARY KEY,
--     class_id INT NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
--     title VARCHAR(255) NOT NULL,
--     description TEXT,
--     deadline TIMESTAMP,
--     rubric_id INT REFERENCES rubrics(rubric_id) ON DELETE SET NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Submissions
-- CREATE TABLE submissions (
--     submission_id SERIAL PRIMARY KEY,
--     assignment_id INT NOT NULL REFERENCES assignments(assignment_id) ON DELETE CASCADE,
--     student_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
--     content TEXT,
--     attachments JSON,
--     submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     score INT DEFAULT NULL,
--     teacher_comment TEXT,
--     UNIQUE (assignment_id, student_id)
-- );

-- -- Peer Reviews
-- CREATE TABLE peer_reviews (
--     review_id SERIAL PRIMARY KEY,
--     submission_id INT NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
--     reviewer_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
--     comments TEXT DEFAULT NULL,
--     status review_status DEFAULT 'PENDING',
--     review_deadline TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Notifications
-- CREATE TABLE notifications (
--     notification_id SERIAL PRIMARY KEY,
--     user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
--     type notification_type NOT NULL,
--     message TEXT NOT NULL,
--     link VARCHAR(255),
--     is_read BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
