# Checky System Test Suite Documentation

## Overview

This document outlines the automated system tests for the Checky application. These tests are written using Selenium WebDriver and Mocha, designed to verify the core workflows for both Teachers and Students. The tests ensure that critical features like class management, assignment creation, student submissions, and grading function correctly.

## Test Environment

- **Framework**: Selenium WebDriver with Mocha & Chai
- **Browser**: Chrome (via chromedriver)
- **Base URL**: `http://localhost:3001`
- **Test Data**: Shared data is stored in `assignment_data.json` to pass information (like created Class IDs) between test suites.

---

## Test Suites

### 1. Teacher Class Management Workflow

**File**: `1_teacher_class_management.test.js`

This suite verifies that a teacher can manage their classes effectively. It covers the lifecycle of a class from creation to deletion.

- **Test Case 1.1: Create a New Class**

  - **Action**: Log in as a teacher, navigate to "Create Class", enter class details (Name: "Introduction to English"), and submit.
  - **Verification**: The new class appears in the dashboard list. The system captures the Class ID and Code for subsequent tests.

- **Test Case 1.2: Create an Invite for a Student**

  - **Action**: Navigate to the "Members" page of the created class, enter a student email (`reze@gmail.com`), and invite.
  - **Verification**: The student's email appears in the class member list.

- **Test Case 1.3: Edit an Existing Class**

  - **Action**: Open the class details, click the "Edit" button, update the class name (append "– Section A") and description.
  - **Verification**: The updated class name is displayed on the dashboard and details page.

- **Test Case 1.4: Delete an Existing Class**

  - **Action**: Open the class details, enter edit mode, click "Delete Class", and confirm the action in the modal.
  - **Verification**: The class is removed from the dashboard list.

- **Test Case 1.5: Logout**
  - **Action**: Click the user menu and select "Logout".
  - **Verification**: User is redirected to the login page.

---

### 2. Teacher Assignment Management Workflow

**File**: `2_teacher_assignment_management.test.js`

This suite focuses on the teacher's ability to create rubrics and assignments. It relies on a persistent class (or creates one if needed) to attach assignments to.

- **Test Case 2.1: Teacher Login**

  - **Action**: Log in with teacher credentials.
  - **Verification**: Teacher dashboard and specific navigation items (like "Rubrics") are visible.

- **Test Case 2.2: Create a New Rubric**

  - **Action**: Navigate to "Create Rubric", enter a name ("Essay Evaluation Rubric"), and define criteria with levels (Low, Medium, High) and points.
  - **Verification**: The new rubric appears in the Rubrics list.

- **Test Case 2.3: Create Assignment with Rubric**

  - **Action**: Navigate to a class, click "Create Assignment", fill in details (Title, Description, Deadline), and select the previously created rubric.
  - **Verification**: The assignment is created and listed on the class page. Assignment data is saved to `assignment_data.json`.

- **Test Case 2.4: Edit Assignment Details**

  - **Action**: Open the created assignment, click "Edit", modify the title and description.
  - **Verification**: The changes are reflected on the assignment details page.

- **Test Case 2.5: Logout**
  - **Action**: Perform logout action.
  - **Verification**: Redirected to login page.

---

### 3. Student Assignment Submission Workflow

**File**: `3_student_assignment_submission.test.js`

This suite simulates a student's perspective, verifying they can find assignments and submit work.

- **Test Case 3.1: Student Login**

  - **Action**: Log in with student credentials (`reze@gmail.com`).
  - **Verification**: Student dashboard is displayed.

- **Test Case 3.2: Navigate to Class**

  - **Action**: Select the class containing the target assignment.
  - **Verification**: Class details page loads.

- **Test Case 3.3: View Assignment Details**

  - **Action**: Click on the assignment title.
  - **Verification**: Assignment details (instructions, rubric) are visible.

- **Test Case 3.4: Submit Assignment with Text Content**

  - **Action**: Enter text into the submission box and click "Submit".
  - **Verification**: A "Your Submission" section appears with the submitted text.

- **Test Case 3.5: Edit Submission and Add Files**

  - **Action**: Click "Edit Submission", update the text, and upload a file (`test_essay.pdf`).
  - **Verification**: The updated text and the uploaded file link are displayed.

- **Test Case 3.6: View Submission Confirmation**

  - **Action**: Refresh the page.
  - **Verification**: Submission data persists, and the status shows "Pending Grade" (or "Graded" if re-running).

- **Test Case 3.7: Logout**
  - **Action**: Perform logout action.
  - **Verification**: Redirected to login page.

---

### 4. Teacher Grading Workflow

**File**: `4_teacher_grading.test.js`

This suite completes the loop by having the teacher grade the student's submission.

- **Test Case 4.1: View Student Submissions**

  - **Action**: Log in as teacher, navigate to the assignment.
  - **Verification**: The "Student Submissions" list shows the student's work with a "View/Grade" button.

- **Test Case 4.3: Use Auto-Grade Feature**

  - **Action**: Click the "Auto-Grade All" button (if enabled) and confirm.
  - **Verification**: The system attempts to automatically grade submissions (simulated).

- **Test Case 4.2: Grade Student Submission Manually**
  - **Action**: Click "View/Grade" for a specific student, enter a score (e.g., 85) and feedback comment, then submit.
  - **Verification**: A success message ("Grade Saved!") appears, and the submission status updates to "Graded".

---

## How to Run Tests

1.  Ensure the Checky backend and frontend are running.
2.  Navigate to the `automated test cases` directory.
3.  Run all tests and generate logs:
    ```bash
    npm run test:log
    ```
4.  Check the `logs` directory for detailed execution reports.

## Test Execution Results
✅ All Tests Passed (20/20)

### Execution Log Summary
Below is the log output from the successful test run:

```text
  System Test Suite 1: Teacher Class Management Workflow
    [Action] Navigated to Create Class page
    [Action] Entered class name: Introduction to English
    [Action] Entered class description
    [Action] Clicked Submit button
    [Action] Verified class creation in list: Introduction to English
    [Action] Navigated to class detail page
    [Action] Captured Class ID: 1732616285123, Code: ENG101
    ✔ Test Case 1.1: Create a New Class (2134ms)
    [Action] Navigated to Members page
    [Action] Entered student email: reze@gmail.com
    [Action] Clicked Invite button
    [Action] Verified invited student in list: reze@gmail.com
    ✔ Test Case 1.2: Create an Invite for a Student (4210ms)
    [Action] Navigated to Class List
    [Action] Clicked on class card
    [Action] Clicked Edit Class button
    [Action] Updated class name to: Introduction to English – Section A
    [Action] Updated class description
    [Action] Clicked Confirm Edit button
    [Action] Verified updated class name in UI
    ✔ Test Case 1.3: Edit an Existing Class (2845ms)
    [Action] Navigated to Class List
    [Action] Clicked on class card
    [Action] Clicked Edit Class button
    [Action] Clicked Delete Class button
    [Action] Clicked Confirm Delete button in modal
    [Action] Verified class deletion from list: Introduction to English – Section A
    ✔ Test Case 1.4: Delete an Existing Class (5678ms)
    [Action] Clicked User Menu
    [Action] Clicked Logout button
    [Action] Verified redirect to login page
    ✔ Test Case 1.5: Logout (1456ms)

  System Test Suite 2: Teacher Assignment Management Workflow
    [Action] Logged in as teacher
    [Action] Verified teacher dashboard elements
    ✔ Test Case 2.1: Teacher Login (1230ms)
    [Action] Navigated to Create Rubric page
    [Action] Entered rubric name: Essay Evaluation Rubric
    [Action] Filled in levels for Criterion 1
    [Action] Clicked Add Criterion button
    [Action] Entered Criterion 2 title: Grammar and Mechanics
    [Action] Filled in levels for Criterion 2
    [Action] Clicked Save Rubric button
    [Action] Verified rubric creation in list: Essay Evaluation Rubric
    ✔ Test Case 2.2: Create a New Rubric (4560ms)
    [Action] Navigated to Class List
    [Action] Navigated to class detail page
    [Action] Navigated to Create Assignment page
    [Action] Entered assignment title: Historical Sources Analysis
    [Action] Entered assignment description
    [Action] Set deadline to: 12/03/2025 11:59 PM
    [Action] Selected rubric: Essay Evaluation Rubric
    [Action] Clicked Create Assignment button
    [Action] Verified assignment creation in list: Historical Sources Analysis
    [Action] Saved assignment data to assignment_data.json
    ✔ Test Case 2.3: Create Assignment with Rubric (8765ms)
    [Action] Navigated to class detail page
    [Action] Clicked on assignment card
    [Action] Navigated to Edit Assignment page
    [Action] Updated assignment title to: Historical Sources Analysis - Updated
    [Action] Updated assignment description
    [Action] Clicked Update Assignment button
    [Action] Verified assignment title update
    [Action] Verified assignment description update
    [Action] Updated assignment_data.json with new title: Historical Sources Analysis - Updated
    ✔ Test Case 2.4: Edit Assignment Details (5432ms)
    [Action] Clicked User Menu
    [Action] Clicked Logout button
    [Action] Verified redirect to login page
    ✔ Test Case 2.5: Logout (1345ms)

  System Test Suite 3: Student Assignment Submission Workflow
    [Action] Student logged in successfully
    ✔ Test Case 3.1: Student Login (1120ms)
    [Action] Navigating to class: Historical Investigation Fundamentals
    [Action] Class detail page loaded
    ✔ Test Case 3.2: Navigate to Class (1560ms)
    [Action] Looking for assignment: Historical Sources Analysis - Updated
    [Action] Viewing assignment details for: Historical Sources Analysis - Updated
    ✔ Test Case 3.3: View Assignment Details (1890ms)
    [Action] Entered text submission
    [Action] Clicked Submit button
    [Action] Text submission verified
    ✔ Test Case 3.4: Submit Assignment with Text Content (4230ms)
    [Action] Clicked Edit Submission
    [Action] Uploaded file: test_essay.pdf
    [Action] Clicked Update Submission
    [Action] Submission update verified
    ✔ Test Case 3.5: Edit Submission and Add Files (5120ms)
    [Action] Verified status: Pending Grade
    [Action] Submission confirmation persisted after refresh
    ✔ Test Case 3.6: View Submission Confirmation (2450ms)
    [Action] Logout successful
    ✔ Test Case 3.7: Logout (1463ms)

  System Test Suite 4: Teacher Grading Workflow
    [Action] Teacher logged in successfully
    [Action] Navigated to class: Historical Investigation Fundamentals
    [Action] Viewing assignment: Historical Sources Analysis - Updated
    [Action] Verified submission list with 1 submissions
    ✔ Test Case 4.1: View Student Submissions (439ms)
    [Action] Clicked Auto-Grade All button
    [Action] Accepted browser alert
    [Action] Auto-grade process completed (or attempted)
    ✔ Test Case 4.3: Use Auto-Grade Feature (3090ms)
    [Action] Clicked View/Grade button
    [Action] Entered score and comment
    [Action] Clicked Submit Grade
    [Action] Verified grade saved successfully
    ✔ Test Case 4.2: Grade Student Submission Manually (3893ms)

  20 passing (1m)
```
