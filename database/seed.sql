-- ------------------------------
-- PostgreSQL Seed Data for Checky
-- ------------------------------

-- Users
INSERT INTO users (firstName, lastName, email, password, role) VALUES
('John', 'Doe', 'john.doe@example.com', 'hashedpassword1', 'student'),
('Jane', 'Doe', 'jane.smith@example.com', 'hashedpassword2', 'student'),
('Alan', 'Turing', 'alan.turing@example.com', 'hashedpassword3', 'teacher'),
('Grace', 'Hopper', 'grace.hopper@example.com', 'hashedpassword4', 'teacher');
