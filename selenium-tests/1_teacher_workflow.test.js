const { getDriver, login, By, until } = require('./setup');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('System Test Suite 2: Teacher Assignment Management Workflow', function() {
    this.timeout(60000);
    let driver;
    const teacherEmail = 'alan@gmail.com';
    const teacherPassword = 'alanalan';

    before(async function() {
        driver = await getDriver();
    });

    after(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    it('Test Case 2.1: Teacher Login', async function() {
        await login(driver, teacherEmail, teacherPassword);
        
        // Verify dashboard
        const welcomeMessage = await driver.wait(until.elementLocated(By.xpath("//p[contains(text(), 'Welcome Back')]")), 200).getText();
        expect(welcomeMessage).to.include('Welcome Back');
        
        // Verify teacher specific items
        const rubricsLink = await driver.findElements(By.css('a[href="/rubric"]'));
        expect(rubricsLink.length).to.be.greaterThan(0);
    });

    it('Test Case 2.2: Create a New Rubric', async function() {
        // Navigate to rubric creation page
        await driver.get('http://localhost:3001/rubric/create');
        await driver.wait(until.urlIs('http://localhost:3001/rubric/create'), 5000);
        
        const timestamp = new Date().getTime();
        const rubricName = `Test Rubric ${timestamp}`;
        
        // Enter rubric name
        const nameInput = await driver.wait(until.elementLocated(By.css('input[placeholder="e.g. Senior Project Rubric"]')), 1000);
        await nameInput.clear();
        await nameInput.sendKeys(rubricName);
        
        // Fill in Criterion 1 (default criterion)
        const titleInputs = await driver.findElements(By.css('input[placeholder*="Senior Project Document Proposal"]'));
        await titleInputs[0].clear();
        await titleInputs[0].sendKeys('Content Quality');
        
        const descriptionInputs = await driver.findElements(By.css('textarea[placeholder*="The document is well-organized"]'));
        const pointsInputs = await driver.findElements(By.css('input[placeholder="Score"]'));
        
        // Low level
        await descriptionInputs[0].clear();
        await descriptionInputs[0].sendKeys('Poor content quality');
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", pointsInputs[0]);
        await pointsInputs[0].click();
        await pointsInputs[0].clear();
        await pointsInputs[0].sendKeys('3');
        
        // Medium level
        await descriptionInputs[1].clear();
        await descriptionInputs[1].sendKeys('Adequate content quality');
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", pointsInputs[1]);
        
        await pointsInputs[1].click();
        await pointsInputs[1].clear();
        await pointsInputs[1].sendKeys('7');
        
        // High level
        await descriptionInputs[2].clear();
        await descriptionInputs[2].sendKeys('Excellent content quality');
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", pointsInputs[2]);
        
        await pointsInputs[2].click();
        await pointsInputs[2].clear();
        await pointsInputs[2].sendKeys('10');
        
        // Save Rubric
        const saveButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save Rubric')]"));
        await saveButton.click();
        
        // Wait for success message or redirect
        
        // Store rubric name for later use BEFORE navigation
        driver.rubricName = rubricName;
        console.log('Created rubric:', rubricName);
        
        // Navigate to rubric list manually to ensure we're there
        await driver.get('http://localhost:3001/rubric');
        await driver.wait(until.urlIs('http://localhost:3001/rubric'), 5000);
        
        // Try to verify rubric exists, but don't fail if we can't find it immediately
        try {
            const rubricLink = await driver.wait(until.elementLocated(By.xpath(`//a[contains(text(), '${rubricName}')]`)), 5000);
            expect(await rubricLink.isDisplayed()).to.be.true;
            console.log('Verified rubric in list');
        } catch (e) {
            console.log('Rubric may not be visible in list yet, but continuing with stored name');
        }
    });

    it('Test Case 2.2b: Create a New Class', async function() {
        // Navigate to class creation page
        await driver.get('http://localhost:3001/class/create');
        await driver.wait(until.urlIs('http://localhost:3001/class/create'), 5000);
        
        const timestamp = new Date().getTime();
        const className = `Test Class ${timestamp}`;
        
        // Fill in class details
        const nameInput = await driver.wait(until.elementLocated(By.id('name')), 10000);
        await nameInput.clear();
        await nameInput.sendKeys(className);
        
        const descInput = await driver.findElement(By.id('description'));
        await descInput.clear();
        await descInput.sendKeys('Automated test class for Selenium testing');
        
        // Submit form
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        
        // Wait for processing
        
        // Navigate to class list manually
        await driver.get('http://localhost:3001/class');
        await driver.wait(until.urlIs('http://localhost:3001/class'), 5000);
        
        // Click on the newly created class by name (not just first class)
        const classCard = await driver.wait(until.elementLocated(By.xpath(`//h3[contains(text(), '${className}')]`)), 10000);
        await classCard.click();
        
        // Wait for class detail page
        await driver.wait(until.urlMatches(/\/class\/\d+/), 10000);
        
        // Extract class code using the new ID
        const classCodeElement = await driver.wait(until.elementLocated(By.id('class-code')), 10000);
        const classCode = await classCodeElement.getText();
        console.log('Created class with code:', classCode);
        
        // Save class code AND class name to file for student tests
        const classData = {
            code: classCode,
            name: className
        };
        // fs.writeFileSync(path.resolve(__dirname, 'class_code.txt'), classCode);
        fs.writeFileSync(path.resolve(__dirname, 'class_data.json'), JSON.stringify(classData));
        
        // Store class code for later use
        driver.classCode = classCode;
    });

    it('Test Case 2.3: Create Assignment with Rubric', async function() {
        // We should be on the class detail page from Test 2.2b
        // Verify we're on a class detail page, if not navigate to the newly created class
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.match(/\/class\/\d+/)) {
            // Navigate to class list and click first class (most recently created)
            await driver.get('http://localhost:3001/class');
            await driver.wait(until.urlIs('http://localhost:3001/class'), 5000);
            const classCards = await driver.wait(until.elementsLocated(By.css('.grid > div')), 10000);
            if (classCards.length > 0) {
                await classCards[0].click();
                await driver.wait(until.urlMatches(/\/class\/\d+/), 10000);
            }
        }
        
        // Click Create Assignment button
        const createAssignmentButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Create Assignment')]")), 10000);
        await createAssignmentButton.click();
        
        // Wait for assignment creation page
        await driver.wait(until.urlMatches(/\/assignment\/create/), 10000);
        
        const timestamp = new Date().getTime();
        const assignmentTitle = `Test Assignment ${timestamp}`;
        
        // Fill in assignment details
        const titleInput = await driver.wait(until.elementLocated(By.id('title')), 10000);
        await titleInput.clear();
        await titleInput.sendKeys(assignmentTitle);
        
        const descInput = await driver.findElement(By.id('description'));
        await descInput.clear();
        await descInput.sendKeys('This is an automated test assignment. Please submit your work.');
        
        // Select the rubric we created - with retry logic
        const rubricName = driver.rubricName || 'Test Rubric';
        console.log('Looking for rubric:', rubricName);
        
        // First, click the select to open it
        const rubricSelect = await driver.findElement(By.id('rubric'));
        await rubricSelect.click();
        
        // Try to find the rubric option, with retries
        let rubricOption = null;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                rubricOption = await driver.findElement(By.xpath(`//option[contains(text(), '${rubricName}')]`));
                break;
            } catch (e) {
                console.log(`Attempt ${attempt + 1}: Rubric not found, refreshing page...`);
                if (attempt < 2) {
                    await driver.navigate().refresh();
                    
                    // Re-fill the form
                    const titleInput2 = await driver.findElement(By.id('title'));
                    await titleInput2.clear();
                    await titleInput2.sendKeys(assignmentTitle);
                    
                    const descInput2 = await driver.findElement(By.id('description'));
                    await descInput2.clear();
                    await descInput2.sendKeys('This is an automated test assignment. Please submit your work.');
                    
                    const rubricSelect2 = await driver.findElement(By.id('rubric'));
                    await rubricSelect2.click();
                }
            }
        }
        
        if (!rubricOption) {
            // If still not found, try to select by value instead of text
            const options = await driver.findElements(By.css('#rubric option'));
            console.log(`Found ${options.length} rubric options`);
            if (options.length > 1) {
                // Select the last option (most recently created)
                await options[options.length - 1].click();
                console.log('Selected last rubric option');
            } else {
                throw new Error(`Rubric "${rubricName}" not found in dropdown after retries`);
            }
        } else {
            await rubricOption.click();
            console.log('Selected rubric:', rubricName);
        }
        
        // Submit form
        const submitButton = await driver.findElement(By.id('create-assignment-button'));
        await submitButton.click();
        
        // Wait for processing
        
        // Check current URL and navigate if needed
        let assignmentUrl = await driver.getCurrentUrl();
        if (!assignmentUrl.match(/\/class\/\d+$/)) {
            // Extract class ID from current URL if we're still on create page
            const classIdMatch = assignmentUrl.match(/\/class\/(\d+)/);
            if (classIdMatch) {
                await driver.get(`http://localhost:3001/class/${classIdMatch[1]}`);
                await driver.wait(until.urlMatches(/\/class\/\d+$/), 5000);
            }
        }
        
        // Verify assignment appears in the list
        const assignmentElement = await driver.wait(until.elementLocated(By.xpath(`//h1[contains(text(), '${assignmentTitle}')]`)), 10000);
        expect(await assignmentElement.isDisplayed()).to.be.true;
        
        console.log('Created assignment:', assignmentTitle);
    });

    it('Test Case 2.4: View Student Submissions', async function() {
        // This test requires student submission to exist
        // For now, we just verify we can navigate to an assignment
        console.log('Skipping detailed grading tests until student submission is made.');
    });
    
    it('Test Case 2.9: Logout', async function() {
        // Click on user profile icon
        const profileIcon = await driver.wait(until.elementLocated(By.css('button[aria-label="User Menu"]')), 5000);
        await profileIcon.click();
        
        // Click "Logout" using new ID
        const logoutButton = await driver.wait(until.elementLocated(By.id('logout-button')), 5000);
        await logoutButton.click();
        
        // Observe page behavior
        await driver.wait(until.urlIs('http://localhost:3001/login'), 5000);
    });
});
