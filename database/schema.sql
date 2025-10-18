CREATE DATABASE IF NOT EXISTS checkydb;
USE checkydb;

-- Users table (students & teachers)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    class_code VARCHAR(50) UNIQUE,
    teacher_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Student-Class Membership table
CREATE TABLE class_members (
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, student_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Rubrics table
CREATE TABLE rubrics (
    rubric_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Rubric criteria table
CREATE TABLE rubric_criteria (
    criterion_id INT AUTO_INCREMENT PRIMARY KEY,
    rubric_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    FOREIGN KEY (rubric_id) REFERENCES rubrics(rubric_id) ON DELETE CASCADE
);

-- Rubric levels table
CREATE TABLE rubric_levels (
    level_id INT AUTO_INCREMENT PRIMARY KEY,
    criterion_id INT NOT NULL,
    level_name ENUM('Low','Medium','High') NOT NULL,
    score INT NOT NULL,
    description TEXT,
    FOREIGN KEY (criterion_id) REFERENCES rubric_criteria(criterion_id) ON DELETE CASCADE
);

-- Assignments table
CREATE TABLE assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATETIME,
    rubric_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (rubric_id) REFERENCES rubrics(rubric_id) ON DELETE SET NULL
);

-- Submissions table
CREATE TABLE submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    content TEXT,
    attachments JSON,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    score INT DEFAULT NULL,
    teacher_comment TEXT,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (assignment_id, student_id)
);

-- Peer Reviews table
CREATE TABLE peer_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    comments TEXT DEFAULT NULL,
    status ENUM('PENDING', 'COMPLETED') DEFAULT 'PENDING',
    review_deadline DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('GRADE_RELEASED','NEW_COMMENT','PEER_REVIEW_ASSIGNED','NEW_ASSIGNMENT') NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
