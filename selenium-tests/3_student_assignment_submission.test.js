const { getDriver, login, By, until } = require('./setup');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

describe('System Test Suite 3: Student Assignment Submission Workflow', function() {
    this.timeout(60000);
    let driver;
    const studentEmail = 'reze@gmail.com';
    const studentPassword = 'rezereze';
    
    // Default values, will be overwritten by assignment_data.json if it exists
    let className = 'Introduction to Literature';
    let assignmentTitle = 'Essay on Modern Poetry';
    let classId = null;

    before(async function() {
        driver = await getDriver();
        
        // Try to load shared data from Teacher Assignment flow
        const assignmentDataPath = path.resolve(__dirname, 'assignment_data.json');
        if (fs.existsSync(assignmentDataPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(assignmentDataPath, 'utf8'));
                if (data.className) className = data.className;
                if (data.title) assignmentTitle = data.title;
                if (data.classId) classId = data.classId;
                console.log(`[Setup] Loaded shared test data: Class="${className}", Assignment="${assignmentTitle}"`);
            } catch (e) {
                console.error('[Setup] Error reading assignment_data.json:', e);
            }
        } else {
            console.log('[Setup] assignment_data.json not found, using defaults.');
        }
    });

    after(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    it('Test Case 3.1: Student Login', async function() {
        await login(driver, studentEmail, studentPassword);
        
        // Verify dashboard
        const welcomeMessage = await driver.wait(until.elementLocated(By.xpath("//p[contains(text(), 'Welcome Back')]")), 5000).getText();
        expect(welcomeMessage).to.include('Welcome Back');
        
        // Verify student specific items (e.g., Peer Reviews link which is specific to students/teachers but mainly students in this context)
        // Or just verify we are on dashboard
        await driver.wait(until.urlIs('http://localhost:3001/'), 5000);
        console.log('[Action] Student logged in successfully');
    });

    it('Test Case 3.2: Navigate to Class', async function() {
        // Navigate to classes page
        await driver.get('http://localhost:3001/class');
        await driver.wait(until.urlIs('http://localhost:3001/class'), 5000);
        
        // Click on the specific class card
        console.log(`[Action] Navigating to class: ${className}`);
        const classCard = await driver.wait(until.elementLocated(By.xpath(`//h3[contains(text(), '${className}')]`)), 10000);
        await classCard.click();
        
        // Wait for class detail page
        await driver.wait(until.urlMatches(/\/class\/\d+/), 5000);
        
        // Verify class name is displayed on the page
        const classHeader = await driver.wait(until.elementLocated(By.xpath(`//h1[contains(text(), '${className}')]`)), 5000);
        expect(await classHeader.isDisplayed()).to.be.true;
        console.log('[Action] Class detail page loaded');
    });

    it('Test Case 3.3: View Assignment Details', async function() {
        console.log(`[Action] Looking for assignment: ${assignmentTitle}`);
        // Find the assignment in the list
        const assignmentCard = await driver.wait(until.elementLocated(By.xpath(`//h1[contains(text(), '${assignmentTitle}')]`)), 10000);
        
        // Click on the assignment (need to click the parent clickable div)
        const parentDiv = await assignmentCard.findElement(By.xpath('./ancestor::div[contains(@class, "cursor-pointer")]'));
        await parentDiv.click();
        
        // Wait for assignment detail page
        await driver.wait(until.urlMatches(/\/assignment\/\d+/), 5000);
        
        // Verify assignment title
        const titleElement = await driver.wait(until.elementLocated(By.xpath(`//h1[contains(text(), '${assignmentTitle}')]`)), 5000);
        expect(await titleElement.isDisplayed()).to.be.true;
        
        console.log(`[Action] Viewing assignment details for: ${assignmentTitle}`);
    });

    it('Test Case 3.4: Submit Assignment with Text Content', async function() {
        // Check if already submitted (if re-running tests)
        const pageSource = await driver.getPageSource();
        if (pageSource.includes('Your Submission')) {
            console.log('[Info] Assignment already submitted, skipping text submission step');
            return;
        }

        // Locate textarea by ID
        const textarea = await driver.wait(until.elementLocated(By.id('submissionContent')), 5000);
        
        const submissionText = "This is my essay analyzing the historical documents. The sources reveal a complex narrative...";
        await textarea.clear();
        await textarea.sendKeys(submissionText);
        console.log('[Action] Entered text submission');
        
        // Click Submit button (text is "Submit" not "Submit Assignment")
        const submitButton = await driver.findElement(By.xpath("//button[text()='Submit' or text()='Update Submission']"));
        
        // Scroll to button to ensure visibility
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", submitButton);
        await driver.sleep(500);
        await submitButton.click();
        console.log('[Action] Clicked Submit button');
        
        // Wait for submission to process (might reload or show success)
        await driver.sleep(3000);
        
        // Verify "Your Submission" section appears (it's an h3 with id="submission-heading")
        const submissionSection = await driver.wait(until.elementLocated(By.id('submission-heading')), 10000);
        expect(await submissionSection.isDisplayed()).to.be.true;
        
        // Verify text content
        const submittedText = await driver.findElement(By.xpath(`//p[contains(text(), "historical documents")]`));
        expect(await submittedText.isDisplayed()).to.be.true;
        
        console.log('[Action] Text submission verified');
    });

    it('Test Case 3.5: Edit Submission and Add Files', async function() {
        // Find Edit Submission button
        const editButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Edit Submission')]")), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", editButton);
        await driver.sleep(500);
        await editButton.click();
        console.log('[Action] Clicked Edit Submission');
        
        // Wait for edit mode (textarea should appear again)
        const textarea = await driver.wait(until.elementLocated(By.id('submissionContent')), 5000);
        
        // Update text
        const updatedText = "Updated: This is my essay analyzing the historical documents. The sources reveal a complex narrative...";
        await textarea.clear();
        await textarea.sendKeys(updatedText);
        
        // Upload file
        // Find file input (it might be hidden, so we send keys to it directly)
        const fileInput = await driver.findElement(By.css('input[type="file"]'));
        const filePath = path.resolve(__dirname, 'test_essay.pdf');
        await fileInput.sendKeys(filePath);
        console.log('[Action] Uploaded file: test_essay.pdf');
        
        // Wait for file to appear in list
        await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'test_essay.pdf')]")), 5000);
        
        // Click Update Submission button
        const updateButton = await driver.findElement(By.xpath("//button[text()='Update Submission']"));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", updateButton);
        await driver.sleep(500);
        await updateButton.click();
        console.log('[Action] Clicked Update Submission');
        
        // Wait for update to process
        await driver.sleep(3000);
        
        // Verify updated text
        const submittedText = await driver.wait(until.elementLocated(By.xpath(`//p[contains(text(), "Updated: This is my essay")]`)), 10000);
        expect(await submittedText.isDisplayed()).to.be.true;
        
        // Verify file is listed
        const fileLink = await driver.findElement(By.xpath("//a[contains(@href, 'download') or contains(text(), 'Download')]"));
        expect(await fileLink.isDisplayed()).to.be.true;
        
        console.log('[Action] Submission update verified');
    });

    it('Test Case 3.6: View Submission Confirmation', async function() {
        // Refresh page to ensure persistence
        await driver.navigate().refresh();
        await driver.sleep(2000);
        
        // Verify "Your Submission" section
        const submissionSection = await driver.wait(until.elementLocated(By.id('submission-heading')), 10000);
        expect(await submissionSection.isDisplayed()).to.be.true;
        
        // Verify status badge (Pending Grade)
        const statusBadge = await driver.findElement(By.id('submission-status'));
        expect(await statusBadge.isDisplayed()).to.be.true;
        
        console.log('[Action] Submission confirmation persisted after refresh');
    });

    it('Test Case 3.7: Logout', async function() {
        // Ensure we're on a stable page
        await driver.get('http://localhost:3001/');
        await driver.wait(until.urlIs('http://localhost:3001/'), 5000);
        
        // Click on user profile icon
        const profileIcon = await driver.wait(until.elementLocated(By.css('button[aria-label="User Menu"]')), 5000);
        await profileIcon.click();
        
        // Wait for dropdown menu to appear
        await driver.sleep(1000);
        
        // Click "Logout" using JavaScript to avoid visibility issues
        const logoutButton = await driver.wait(until.elementLocated(By.id('logout-button')), 5000);
        await driver.executeScript("arguments[0].click();", logoutButton);
        
        // Verify redirect to login page
        await driver.wait(until.urlIs('http://localhost:3001/login'), 5000);
        console.log('[Action] Logout successful');
    });
});
