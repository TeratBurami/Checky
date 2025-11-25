# Unit Testing Report

## Project Information
This report documents the unit testing implementation for the Checky backend application. We have successfully implemented comprehensive unit test suites covering critical functionality including authentication, user management, class management, and notification systems.
- **Project Name:** Checky - Backend API
- **Testing Framework:** Jest
- **Test Runner:** Jest with Babel transformation
- **Mocking Library:** Jest built-in mocking
- **HTTP Testing:** Supertest v7.1.4

---

### Overall Test Results
![image](../images/image1.png)
![image](../images/image2.png)
- **Total Test Suites:** 11/11 passed
- **Total Test Cases:** 92/92 passed
- **Success Rate:** 100%

---

## Test Suite Overview

### 1. Authentication Middleware Test Suite (`test/middleware/auth.test.js`)

**Module Under Test:** `middleware/auth.js`

**Purpose:** Tests the JWT authentication middleware that protects API routes and enforces role-based access control.

**Coverage Metrics:**
- **Statement Coverage:** 100% (10/10 lines)
- **Branch Coverage:** 100% (9/9 branches)
- **Function Coverage:** 100% (2/2 functions)

#### Test Cases:

1. **Test Case 1.1: Missing Token Authentication**
   - **Description:** Verifies that requests without an authentication token are rejected with 401 Unauthorized status
   - **Technique:** Input Space Partitioning (ISP) - Testing invalid input (missing token)
   - **Expected Result:** HTTP 401 with error message "Unauthorized"
   - **Status:** ✅ PASSED

2. **Test Case 1.2: Invalid Token Handling**
   - **Description:** Tests that malformed or invalid JWT tokens are properly rejected
   - **Technique:** ISP - Testing invalid input (corrupted token)
   - **Expected Result:** HTTP 401 with error message "Invalid or expired token"
   - **Status:** ✅ PASSED

3. **Test Case 1.3: Insufficient Role Authorization**
   - **Description:** Ensures that users with valid tokens but insufficient role permissions are denied access
   - **Technique:** Logic Coverage - Testing authorization logic with valid authentication but invalid authorization
   - **Expected Result:** HTTP 403 with error message "Forbidden: insufficient role"
   - **Status:** ✅ PASSED

4. **Test Case 1.4: Successful Authentication with Valid Role**
   - **Description:** Verifies that requests with valid tokens and appropriate roles are granted access
   - **Technique:** ISP - Testing valid input (correct token and role)
   - **Expected Result:** HTTP 200 with user data attached to request object
   - **Status:** ✅ PASSED

---

### 2. User Management Test Suite (`test/routes/apis/user.test.js`)

**Module Under Test:** `routes/apis/user.js`

**Purpose:** Tests user registration, login, logout, profile management, and CRUD operations.

**Coverage Metrics:**
- **Statement Coverage:** 100% (all lines covered)
- **Branch Coverage:** 100% (all branches covered)
- **Function Coverage:** 100% (all functions covered)

#### Test Cases:

1. **Test Case 2.1: Successful User Registration**
   - **Description:** Tests the registration endpoint with valid user data including password hashing
   - **Technique:** ISP - Valid input partition
   - **Expected Result:** HTTP 201 with success message "Register Successfully"
   - **Status:** ✅ PASSED

2. **Test Case 2.2: Registration Error Handling**
   - **Description:** Verifies proper error handling when password hashing fails
   - **Technique:** Branch Coverage - Testing error path
   - **Expected Result:** HTTP 500 with error message
   - **Status:** ✅ PASSED

3. **Test Case 2.3: Registration with Missing Email**
   - **Description:** Tests input validation for required fields
   - **Technique:** ISP - Invalid input partition (missing required field)
   - **Expected Result:** HTTP 400 with error "All fields are required"
   - **Status:** ✅ PASSED

4. **Test Case 2.4: Registration with Invalid Email Format**
   - **Description:** Validates email format checking (missing @ symbol)
   - **Technique:** ISP - Invalid input partition (malformed email)
   - **Expected Result:** HTTP 400 with error "Invalid email format"
   - **Status:** ✅ PASSED

5. **Test Case 2.5: Successful Login**
   - **Description:** Tests login with correct credentials, JWT generation, and cookie setting
   - **Technique:** ISP - Valid input partition
   - **Expected Result:** HTTP 200 with JWT token in cookie
   - **Status:** ✅ PASSED

6. **Test Case 2.6: Login with Non-existent User**
   - **Description:** Tests login failure when user email is not found
   - **Technique:** Branch Coverage - User not found path
   - **Expected Result:** HTTP 401 with "Invalid credentials"
   - **Status:** ✅ PASSED

7. **Test Case 2.7: Login with Incorrect Password**
   - **Description:** Tests login failure when password doesn't match
   - **Technique:** Branch Coverage - Password mismatch path
   - **Expected Result:** HTTP 401 with "Invalid credentials"
   - **Status:** ✅ PASSED

8. **Test Case 2.8: Login Database Error Handling**
   - **Description:** Tests error handling when database query fails
   - **Technique:** Branch Coverage - Exception path
   - **Expected Result:** HTTP 500 with error message
   - **Status:** ✅ PASSED

9. **Test Case 2.9: Successful Logout**
   - **Description:** Tests logout functionality and cookie clearing
   - **Technique:** ISP - Valid operation
   - **Expected Result:** HTTP 200 with cleared authentication cookie
   - **Status:** ✅ PASSED

10. **Test Case 2.10: Get All Users**
    - **Description:** Tests retrieval of all users from database
    - **Technique:** ISP - Valid query
    - **Expected Result:** HTTP 200 with array of user objects
    - **Status:** ✅ PASSED

11. **Test Case 2.11: Get All Users Error Handling**
    - **Description:** Tests error handling for user list retrieval
    - **Technique:** Branch Coverage - Exception path
    - **Expected Result:** HTTP 500 with error message
    - **Status:** ✅ PASSED

12. **Test Case 2.12: Get User by ID**
    - **Description:** Tests retrieval of specific user by ID
    - **Technique:** ISP - Valid ID partition
    - **Expected Result:** HTTP 200 with user object
    - **Status:** ✅ PASSED

13. **Test Case 2.13: Get User by ID - Not Found**
    - **Description:** Tests handling when requested user doesn't exist
    - **Technique:** Branch Coverage - Empty result path
    - **Expected Result:** HTTP 404 with "User not found"
    - **Status:** ✅ PASSED

14. **Test Case 2.14: Get User by ID Error Handling**
    - **Description:** Tests error handling for user retrieval
    - **Technique:** Branch Coverage - Exception path
    - **Expected Result:** HTTP 500 with error message
    - **Status:** ✅ PASSED

15. **Test Case 2.15: Update User Successfully**
    - **Description:** Tests user profile update with valid data
    - **Technique:** ISP - Valid update operation
    - **Expected Result:** HTTP 200 with updated user data
    - **Status:** ✅ PASSED

16. **Test Case 2.16: Update Another User's Profile (Forbidden)**
    - **Description:** Tests authorization check preventing users from updating other users' profiles
    - **Technique:** Logic Coverage - Authorization logic
    - **Expected Result:** HTTP 403 with "Forbidden: can only update your own account"
    - **Status:** ✅ PASSED

17. **Test Case 2.17: Update Non-existent User**
    - **Description:** Tests update operation when user doesn't exist
    - **Technique:** Branch Coverage - Empty result path
    - **Expected Result:** HTTP 404 with "User not found"
    - **Status:** ✅ PASSED

18. **Test Case 2.18: Update User Error Handling**
    - **Description:** Tests error handling during user update
    - **Technique:** Branch Coverage - Exception path
    - **Expected Result:** HTTP 500 with error message
    - **Status:** ✅ PASSED

19. **Test Case 2.19: Delete User Successfully**
    - **Description:** Tests user deletion operation
    - **Technique:** ISP - Valid delete operation
    - **Expected Result:** HTTP 200 with "User deleted successfully"
    - **Status:** ✅ PASSED

20. **Test Case 2.20: Delete Non-existent User**
    - **Description:** Tests deletion when user doesn't exist
    - **Technique:** Branch Coverage - Empty result path
    - **Expected Result:** HTTP 404 with "User not found"
    - **Status:** ✅ PASSED

21. **Test Case 2.21: Delete User Error Handling**
    - **Description:** Tests error handling during user deletion
    - **Technique:** Branch Coverage - Exception path
    - **Expected Result:** HTTP 500 with error message
    - **Status:** ✅ PASSED

---

### 3. Class Management Test Suite (`test/routes/apis/class.test.js`)

**Module Under Test:** `routes/apis/class.js`

**Purpose:** Tests class creation, retrieval, updates, deletion, member management, and class joining functionality.

**Coverage Metrics:**
- **Statement Coverage:** 81.60% (163/200 lines)
- **Branch Coverage:** 50% (branches covered)
- **Function Coverage:** 91.66% (11/12 functions)

#### Test Cases:

1. **Test Case 3.1: Get All Classes (Admin)**
   - **Description:** Tests admin endpoint to retrieve all classes with member counts
   - **Technique:** ISP - Valid query operation
   - **Expected Result:** HTTP 200 with array of all classes
   - **Status:** ✅ PASSED

2. **Test Case 3.2: Get All Classes Error Handling**
   - **Description:** Tests error handling for admin class retrieval
   - **Technique:** Branch Coverage - Exception path
   - **Expected Result:** HTTP 500 with error message
   - **Status:** ✅ PASSED

3. **Test Case 3.3: Get Classes for Teacher**
   - **Description:** Tests retrieval of classes taught by authenticated teacher
   - **Technique:** Logic Coverage - Role-based query logic
   - **Expected Result:** HTTP 200 with teacher's classes
   - **Status:** ✅ PASSED

4. **Test Case 3.4: Get Classes for Student**
   - **Description:** Tests retrieval of classes enrolled by authenticated student
   - **Technique:** Logic Coverage - Role-based query logic
   - **Expected Result:** HTTP 200 with student's enrolled classes
   - **Status:** ✅ PASSED

5. **Test Case 3.5: Get Classes Error Handling**
   - **Description:** Tests error handling for class retrieval
   - **Technique:** Branch Coverage - Exception path
   - **Expected Result:** HTTP 500 with error message
   - **Status:** ✅ PASSED

6. **Test Case 3.6: Create Class Successfully**
   - **Description:** Tests class creation by teacher with unique class code generation
   - **Technique:** ISP - Valid input partition
   - **Expected Result:** HTTP 201 with success message and class code
   - **Status:** ✅ PASSED

7. **Test Case 3.7: Create Class - Teacher Not Found**
   - **Description:** Tests class creation when teacher ID is invalid
   - **Technique:** Branch Coverage - Teacher validation path
   - **Expected Result:** HTTP 404 with "Teacher not found"
   - **Status:** ✅ PASSED

8. **Test Case 3.8: Update Class Successfully**
   - **Description:** Tests class information update by owner teacher
   - **Technique:** ISP - Valid update operation
   - **Expected Result:** HTTP 200 with "Class updated successfully"
   - **Status:** ✅ PASSED

9. **Test Case 3.9: Update Class - Forbidden (Not Owner)**
   - **Description:** Tests authorization check preventing non-owner teachers from updating class
   - **Technique:** Logic Coverage - Ownership validation
   - **Expected Result:** HTTP 403 Forbidden
   - **Status:** ✅ PASSED

10. **Test Case 3.10: Delete Class Successfully**
    - **Description:** Tests class deletion by owner teacher
    - **Technique:** ISP - Valid delete operation
    - **Expected Result:** HTTP 200 with "Class deleted successfully"
    - **Status:** ✅ PASSED

11. **Test Case 3.11: Delete Class - Forbidden (Not Owner)**
    - **Description:** Tests authorization check preventing non-owner teachers from deleting class
    - **Technique:** Logic Coverage - Ownership validation
    - **Expected Result:** HTTP 403 Forbidden
    - **Status:** ✅ PASSED

12. **Test Case 3.12: Get Class Details**
    - **Description:** Tests retrieval of detailed class information including teacher and assignments
    - **Technique:** ISP - Valid query with joins
    - **Expected Result:** HTTP 200 with complete class details
    - **Status:** ✅ PASSED

13. **Test Case 3.13: Get Class Members**
    - **Description:** Tests retrieval of all students enrolled in a class
    - **Technique:** ISP - Valid query operation
    - **Expected Result:** HTTP 200 with array of member objects
    - **Status:** ✅ PASSED

14. **Test Case 3.14: Join Class with Valid Code**
    - **Description:** Tests student joining a class using class code
    - **Technique:** ISP - Valid join operation
    - **Expected Result:** HTTP 201 with "Joined class successfully"
    - **Status:** ✅ PASSED

15. **Test Case 3.15: Join Class - Invalid Code**
    - **Description:** Tests join operation with non-existent class code
    - **Technique:** Branch Coverage - Class not found path
    - **Expected Result:** HTTP 404
    - **Status:** ✅ PASSED

16. **Test Case 3.16: Add Student by Email (Invitation)**
    - **Description:** Tests teacher adding student to class via email invitation
    - **Technique:** ISP - Valid invitation operation
    - **Expected Result:** HTTP 201 with success message
    - **Status:** ✅ PASSED

17. **Test Case 3.17: Add Student - Student Not Found**
    - **Description:** Tests invitation when student email doesn't exist
    - **Technique:** Branch Coverage - Student validation path
    - **Expected Result:** HTTP 404 with error message
    - **Status:** ✅ PASSED
