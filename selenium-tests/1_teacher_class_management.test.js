const { getDriver, login, By, until } = require('./setup');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('System Test Suite 1: Teacher Class Management Workflow', function() {
    this.timeout(60000);
    let driver;
    const teacherEmail = 'alan@gmail.com';
    const teacherPassword = 'alanalan';
    let createdClassName;
    let classId;

    before(async function() {
        driver = await getDriver();
        await login(driver, teacherEmail, teacherPassword);
    });

    after(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    it('Test Case 1.1: Create a New Class', async function() {
        // Navigate to create class page
        await driver.get('http://localhost:3001/class/create');
        await driver.wait(until.urlIs('http://localhost:3001/class/create'), 5000);
        
        createdClassName = `Introduction to English`;
        
        // Fill in class details
        const nameInput = await driver.wait(until.elementLocated(By.id('name')), 10000);
        await nameInput.clear();
        await nameInput.sendKeys(createdClassName);
        
        const descInput = await driver.findElement(By.id('description'));
        await descInput.clear();
        await descInput.sendKeys('First-year fundamentals class');
        
        // Submit form
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        
        // Wait for redirect to class list
        await driver.wait(until.urlIs('http://localhost:3001/class'), 10000);
        
        // Verify class appears in list
        const classCard = await driver.wait(until.elementLocated(By.xpath(`//h3[contains(text(), '${createdClassName}')]`)), 10000);
        expect(await classCard.isDisplayed()).to.be.true;
        
        console.log('Created class:', createdClassName);
        
        // Click on the created class to get its ID and code
        await classCard.click();
        await driver.wait(until.urlMatches(/\/class\/\d+/), 5000);
        
        // Extract class ID from URL
        const currentUrl = await driver.getCurrentUrl();
        const classIdMatch = currentUrl.match(/\/class\/(\d+)/);
        classId = classIdMatch ? classIdMatch[1] : null;
        
        // Extract class code
        const classCodeElement = await driver.wait(until.elementLocated(By.id('class-code')), 10000);
        const classCode = await classCodeElement.getText();
        
        console.log(`Class ID: ${classId}, Code: ${classCode}`);
    });

    it('Test Case 1.2: Create an Invite for a Student', async function() {
        // Navigate to members page using the class ID
        await driver.get(`http://localhost:3001/class/${classId}/member`);
        await driver.wait(until.urlContains('/member'), 5000);
        
        // Find the invite input field
        const inviteInput = await driver.wait(until.elementLocated(By.css('input[placeholder*="email" i]')), 10000);
        await inviteInput.clear();
        await inviteInput.sendKeys('reze@gmail.com'); // Use existing student account
        
        // Click invite button
        const inviteButton = await driver.findElement(By.xpath("//button[contains(text(), 'Invite')]"));
        await inviteButton.click();
        
        // Wait for page reload after invite
        await driver.sleep(3000);
        
        // Verify student appears in list
        const studentEmail = await driver.wait(until.elementLocated(By.xpath("//p[contains(text(), 'reze@gmail.com')]")), 10000);
        expect(await studentEmail.isDisplayed()).to.be.true;
        
        console.log('Invited student: reze@gmail.com');
    });

    it('Test Case 1.3: Edit an Existing Class', async function() {
        // Navigate to class list
        await driver.get('http://localhost:3001/class');
        await driver.wait(until.urlIs('http://localhost:3001/class'), 5000);
        
        // Click on the class to open detail page
        const classCard = await driver.wait(until.elementLocated(By.xpath(`//h3[contains(text(), '${createdClassName}')]`)), 10000);
        await classCard.click();
        
        // Wait for class detail page
        await driver.wait(until.urlMatches(/\/class\/\d+/), 5000);
        
        // Click edit icon (pencil icon) - use title attribute
        const editButton = await driver.wait(until.elementLocated(By.css('button[title="Edit Class Details"]')), 10000);
        await editButton.click();
        
        // Wait for edit page
        await driver.wait(until.urlContains('/edit'), 5000);
        
        // Update class name
        const updatedClassName = `${createdClassName} – Section A`;
        const nameInput = await driver.wait(until.elementLocated(By.id('name')), 10000);
        await nameInput.clear();
        await nameInput.sendKeys(updatedClassName);
        
        // Update description
        const descInput = await driver.findElement(By.id('description'));
        await descInput.clear();
        await descInput.sendKeys('First-year fundamentals class (Section A)');
        
        // Click confirm edit button
        const confirmButton = await driver.findElement(By.xpath("//button[contains(text(), 'Confirm Edit') or contains(text(), 'Update') or contains(text(), 'Save')]"));
        await confirmButton.click();
        
        // Wait for redirect
        await driver.wait(until.urlMatches(/\/class(\/\d+)?$/), 10000);
        
        // Verify updated class name appears
        const updatedClassElement = await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${updatedClassName}')]`)), 10000);
        expect(await updatedClassElement.isDisplayed()).to.be.true;
        
        // Update stored class name for next test
        createdClassName = updatedClassName;
        console.log('Updated class name to:', updatedClassName);
    });

    it('Test Case 1.4: Delete an Existing Class', async function() {
        // Navigate to class list
        await driver.get('http://localhost:3001/class');
        await driver.wait(until.urlIs('http://localhost:3001/class'), 5000);
        
        // Click on the class to open detail page
        const classCard = await driver.wait(until.elementLocated(By.xpath(`//h3[contains(text(), '${createdClassName}')]`)), 10000);
        await classCard.click();
        
        // Wait for class detail page
        await driver.wait(until.urlMatches(/\/class\/\d+/), 5000);
        
        // Click edit icon to go to edit page - use title attribute
        const editButton = await driver.wait(until.elementLocated(By.css('button[title="Edit Class Details"]')), 10000);
        await editButton.click();
        
        // Wait for edit page
        await driver.wait(until.urlContains('/edit'), 5000);
        
        // Click delete button
        const deleteButton = await driver.findElement(By.xpath("//button[contains(text(), 'Delete Class')]"));
        await deleteButton.click();
        
        // Handle confirmation popup/modal
        // Wait for modal to appear
        await driver.sleep(1000);
        
        // Find and click "Confirm Delete" button in modal
        const confirmDeleteButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Confirm Delete')]")), 5000);
        await confirmDeleteButton.click();
        console.log('Clicked Confirm Delete button');
        
        // Wait for deletion to complete and redirect
        await driver.sleep(3000);
        
        // Navigate to class list manually if not redirected
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/class') || currentUrl.includes('/edit')) {
            await driver.get('http://localhost:3001/class');
        }
        
        // Wait for class list page
        await driver.wait(until.urlIs('http://localhost:3001/class'), 5000);
        
        // Verify class no longer appears in list
        const deletedClassElements = await driver.findElements(By.xpath(`//h3[contains(text(), '${createdClassName}')]`));
        expect(deletedClassElements.length).to.equal(0);
        
        console.log('Deleted class:', createdClassName);
    });

    it('Test Case 1.5: Logout', async function() {
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
        console.log('✓ Logout successful');
    });
});
