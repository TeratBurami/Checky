# Checky


## 🚀 Checky Project Setup

Welcome to the Checky project\! Follow these steps to get the application up and running using Docker and then start the frontend and backend services.

-----

## Project Structure

```
Checky
├─ backend/
│  └─ test/
│     ├─ middleware
│     │  └─ auth.test.js
│     ├─ routes
│     │  ├─ apis/
│     │  └─ index.test.js
│     └─ server.test.js
├─ database/
├─ docker-compose.yml
├─ frontend/
├─ README.md
├─ selenium-tests
│  ├─ 1_teacher_class_management.test.js
│  ├─ 2_teacher_assignment_management.test.js
│  ├─ 3_student_assignment_submission.test.js
│  ├─ 4_teacher_grading.test.js
│  ├─ assignment_data.json
│  ├─ logs
│  │  └─ README.md
│  ├─ package.json
│  ├─ setup.js
│  └─ test_essay.pdf
└─ tests
   ├─ automated test cases
   │  ├─ 1_teacher_class_management.test.js
   │  ├─ 2_teacher_assignment_management.test.js
   │  ├─ 3_student_assignment_submission.test.js
   │  ├─ 4_teacher_grading.test.js
   │  ├─ assignment_data.json
   │  ├─ Automated_UI_Testing_Report.md                    
   │  └─ setup.js
   ├─ images/
   ├─ manual test cases
   │  ├─ Checky RTM.pdf
   │  ├─ Requirement Traceability Matrix.pdf
   │  ├─ System Test Suite 1_ Teacher Class Management.pdf
   │  ├─ System Test Suite 2_ Teacher Assignment Management Workflow.pdf
   │  ├─ System Test Suite 3_ Student Assignment Submission Workflow.pdf
   │  └─ System Test Suite 4_Teacher Grading Submission Workflow.pdf
   └─ unit-tests
      └─ UNIT_TESTING_REPORT.md

```

### 🔑 Environment Setup (`.env` Files)

Before starting, you must create `.env` files in three locations: the **root** of the project, the **`backend/`** directory, and the **`frontend/`** directory.

> **Note:** The example below should be placed in the `.env` file in the **root** of the project to be picked up by `docker-compose`. Other `.env` files should contain variables specific to the frontend/backend if needed.

**EXAMPLE OF `.env` FILE:**

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=Ch3ckYP@5sW0rd
DB_NAME=checkydb
DB_PORT=5432
PORT=3000
JWT_SECRET=9b7d6c2a1f4e8b3c0a6d5f2e7c4b9a8d3e1f0c5a9b2e7d6f4c3a1e8b7d9f6c2
```

-----

### 🐳 Step 1: Start the Database with Docker

Ensure **Docker** is open and running on your system. Run the following command from the **root** directory of the project to start the database service:

```bash
docker compose up -d --build
```

**IN CASE BACKEND CAN NOT CONNECT PLEASE START DOCKER MANUALLY ON DOCKER DESKTOP OR RUN THIS (WE FOUND THIS UNKNOWN BUG AND CAN NOT RESOLVED)** 
```BASH
docker compose down
docker compose up
```

-----

### 💻 Step 2: Run Frontend and Backend Services

You will need to **split your terminal** into two panes/windows to run both services concurrently.

#### Left Terminal: Frontend Setup

Run the following commands to install dependencies and start the React/Frontend application:

```bash
cd frontend
npm install
npm run dev
```

#### Right Terminal: Backend Setup

Run the following commands to install dependencies and start the Node.js/Backend API:

```bash
cd backend
npm install
npm start
```

-----

## ✅ Testing Procedures

Here are the instructions for running the automated tests for Checky.

### 🧪 Unit Tests (Backend)

Run the unit tests for the backend code. This may take a moment to complete.

In case you dont want to run you can go to **`backend/coverage/lcov-report/`** and open the **`index.html`** file in your web browser that is the last coverage version of our unit test

```bash
cd backend/
npm install
npm test
```

  * A folder named **`coverage/`** will be created upon completion.
  * To view the detailed coverage report, navigate into `coverage/lcov-report/` and open the **`index.html`** file in your web browser.

-----

### 🤖 Automated UI Tests (Selenium)

**Big note that you must start docker for this Automated UI Tests**
Run the automated tests for the user interface. Feel free to take a short break. this process usually takes around **3 minutes**.

```bash
cd selenium-test/
npm install
npm test
```

  * All test cases and their outcomes will be displayed directly in the terminal upon completion.

### All Test report will be in =>
- Unit tests report will be in `/tests/unit-tests/UNIT_TESTING_REPORT.md`
- System tests report will be all PDF file in `/tests/manual test cases/`
- Automated UI Test report will be in `/tests/automated test cases/Automated_UI_Testing_Report.md`
