const { getDriver, login, By, until } = require('./setup');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

describe('System Test Suite 1: Student Assignment Submission Workflow', function() {
    this.timeout(60000);
    let driver;
    const studentEmail = 'reze@gmail.com';
    const studentPassword = 'rezereze';

    before(async function() {
        driver = await getDriver();
    });

    after(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    it('Test Case 1.1: Student Login', async function() {
        await login(driver, studentEmail, studentPassword);
        
        // Verify dashboard
        const welcomeMessage = await driver.wait(until.elementLocated(By.xpath("//p[contains(text(), 'Welcome Back')]")), 10000).getText();
        expect(welcomeMessage).to.include('Welcome Back');
        
        const classesLink = await driver.findElement(By.css('a[href="/class"]'));
        expect(await classesLink.isDisplayed()).to.be.true;
    });

    it('Test Case 1.2: Navigate to Class', async function() {
        // Click "Classes" in navigation bar
        await driver.findElement(By.css('a[href="/class"]')).click();
        await driver.wait(until.urlContains('/class'), 5000);

        // Join class if needed (since we are using a new user)
        let joinedClassCode = null;
        let joinedClassName = null;
        try {
            const classCodePath = path.resolve(__dirname, 'class_code.txt');
            const classDataPath = path.resolve(__dirname, 'class_data.json');
            
            if (fs.existsSync(classCodePath)) {
                const classCode = fs.readFileSync(classCodePath, 'utf8').trim();
                joinedClassCode = classCode; // Store for later use
                console.log('Joining class with code:', classCode);
                
                // Try to read class name from JSON file
                if (fs.existsSync(classDataPath)) {
                    const classData = JSON.parse(fs.readFileSync(classDataPath, 'utf8'));
                    joinedClassName = classData.name;
                    console.log('Class name from file:', joinedClassName);
                }
                
                const joinInput = await driver.findElement(By.css('input[placeholder="Join course by code"]'));
                await joinInput.sendKeys(classCode);
                const joinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Join')]"));
                await joinButton.click();
                // Wait for reload or success
                await driver.sleep(2000);
            } else {
                console.log('Class code file not found, skipping join.');
            }
        } catch (e) {
            console.log("Join input not found or join failed (maybe already joined): " + e.message);
        }

        // If we have the class name, search for it specifically
        // Otherwise, try to find by class code in card text
        let classCard;
        if (joinedClassName) {
            try {
                // Look for a class card with the exact class name
                await driver.sleep(1000); // Wait for class list to update
                classCard = await driver.wait(until.elementLocated(By.xpath(`//h3[contains(text(), '${joinedClassName}')]`)), 10000);
                console.log('Found class by name:', joinedClassName);
            } catch (e) {
                console.log('Could not find class by name, trying by code:', e.message);
                // Fallback: try to find by class code
                if (joinedClassCode) {
                    const allClassCards = await driver.findElements(By.css('.grid > div'));
                    let foundCard = null;
                    for (let card of allClassCards) {
                        const cardText = await card.getText();
                        if (cardText.includes(joinedClassCode)) {
                            foundCard = card;
                            console.log('Found class card with code:', joinedClassCode);
                            break;
                        }
                    }
                    classCard = foundCard || allClassCards[0];
                } else {
                    classCard = await driver.wait(until.elementLocated(By.css('.grid > div')), 10000);
                }
            }
        } else if (joinedClassCode) {
            // No class name, try to find by class code
            try {
                await driver.sleep(1000);
                const allClassCards = await driver.findElements(By.css('.grid > div'));
                let foundCard = null;
                for (let card of allClassCards) {
                    const cardText = await card.getText();
                    if (cardText.includes(joinedClassCode)) {
                        foundCard = card;
                        console.log('Found class card with code:', joinedClassCode);
                        break;
                    }
                }
                classCard = foundCard || allClassCards[0];
            } catch (e) {
                console.log('Could not find specific class, using first class:', e.message);
                classCard = await driver.wait(until.elementLocated(By.css('.grid > div')), 10000);
            }
        } else {
            // No class code or name, just click first class
            classCard = await driver.wait(until.elementLocated(By.css('.grid > div')), 10000);
        }
        
        await classCard.click();
        
        // Observe page content (Class Detail)
        await driver.wait(until.urlMatches(/\/class\/\d+/), 5000);
        const className = await driver.findElement(By.css('h1.text-3xl')).getText();
        expect(className).to.not.be.empty;
    });

    it('Test Case 1.3: View Assignment Details', async function() {
        // Locate an assignment in the assignments list
        const assignmentItem = await driver.wait(until.elementLocated(By.css('.flex-grow.cursor-pointer')), 5000);
        const assignmentTitle = await assignmentItem.findElement(By.css('h1')).getText();
        
        // Click on the assignment
        await assignmentItem.click();
        
        // Verify assignment detail page loads
        await driver.wait(until.urlMatches(/\/assignment\/\d+/), 5000);
        
        // Review all displayed information using the new ID
        const pageTitle = await driver.findElement(By.id('assignment-title')).getText();
        expect(pageTitle).to.equal(assignmentTitle);
        
        const description = await driver.findElement(By.css('p.p-12.text-lg'));
        expect(await description.isDisplayed()).to.be.true;
    });

    it('Test Case 1.4: Submit Assignment with Text Content', async function() {
        // Check if already submitted, if so, we might need to edit or this test assumes fresh state.
        const buttons = await driver.findElements(By.xpath("//button[contains(text(), 'Edit Submission')]"));
        if (buttons.length > 0) {
             await buttons[0].click();
        }

        const textarea = await driver.wait(until.elementLocated(By.id('submissionContent')), 5000);
        await textarea.clear();
        await textarea.sendKeys("This is my essay analyzing T.S. Eliot's 'The Waste Land'. The poem explores themes of disillusionment and fragmentation in post-war society...");
        
        const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit') or contains(text(), 'Update Submission')]"));
        await submitButton.click();
        
        // Wait for response
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Your Submission')]")), 10000);
        
        const submittedText = await driver.findElement(By.xpath("//h4[contains(text(), 'Your Submitted Text')]/following-sibling::p")).getText();
        expect(submittedText).to.include("This is my essay");
    });

    it('Test Case 1.5: Edit Submission and Add Files', async function() {
        // Click "Edit Submission" button
        const editButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Edit Submission')]")), 5000);
        await editButton.click();
        
        // Modify existing text
        const textarea = await driver.wait(until.elementLocated(By.id('submissionContent')), 5000);
        await textarea.sendKeys(" Updated content.");
        
        // Add file
        const fileInput = await driver.findElement(By.css('input[type="file"]'));
        const filePath = path.resolve(__dirname, 'test_file.txt');
        await fileInput.sendKeys(filePath);
        
        // Verify file appears in "Selected Files" list
        await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'test_file.txt')]")), 5000);
        
        // Click "Update Submission" button
        const updateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Update Submission')]"));
        await updateButton.click();
        
        // Wait for response
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Your Submission')]")), 10000);
        
        // Verify file appears in "Your Submitted Files" section
        const submittedFile = await driver.findElement(By.xpath("//p[contains(text(), 'test_file.txt')]"));
        expect(await submittedFile.isDisplayed()).to.be.true;
    });

    it('Test Case 1.6: View Submission Confirmation', async function() {
        // Refresh the assignment detail page
        await driver.navigate().refresh();
        
        // Verify all submission details using new IDs
        await driver.wait(until.elementLocated(By.id('submission-heading')), 5000);
        
        // Check for either status (ungraded) or grade (graded)
        const statusElements = await driver.findElements(By.id('submission-status'));
        if (statusElements.length > 0) {
            const status = await statusElements[0].getText();
            expect(status).to.be.oneOf(['Pending Grade', 'Graded', 'Pending']);
        } else {
            // If no status, check for grade
            const gradeElements = await driver.findElements(By.xpath("//p[contains(text(), 'Graded')]/following-sibling::span"));
            expect(gradeElements.length).to.be.greaterThan(0);
        }
        
        const submittedText = await driver.findElement(By.xpath("//h4[contains(text(), 'Your Submitted Text')]/following-sibling::p")).getText();
        expect(submittedText).to.not.be.empty;
        
        const submittedFile = await driver.findElement(By.xpath("//p[contains(text(), 'test_file.txt')]"));
        expect(await submittedFile.isDisplayed()).to.be.true;
    });

    it('Test Case 1.7: Logout', async function() {
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
