const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');

const getDriver = async () => {
    const options = new chrome.Options();
    
    options.addArguments(
        '--headless=new',
        '--window-size=1920,1080',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-gpu'
    );

    options.setUserPreferences({
        'credentials_enable_service': false,
        'profile.password_manager_enabled': false,
        'profile.password_manager_leak_detection': false,
        'autofill.profile_enabled': false
    });

    options.addArguments('--disable-features=PasswordLeakDetection');
    options.addArguments('--disable-save-password-bubble');

    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    await driver.manage().setTimeouts({ implicit: 5000 });

    return driver;
};

const login = async (driver, email, password) => {
    await driver.get('http://localhost:3001/login');
    await driver.findElement(By.css('input[type="email"]')).sendKeys(email);
    await driver.findElement(By.css('input[type="password"]')).sendKeys(password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wait for navigation
    await driver.wait(until.urlIs('http://localhost:3001/'), 1000);
    
    // Long wait for manual dismissal of password breach warnings
    // If you see a password breach warning, click OK during this time
    console.log('Waiting 3 seconds for any password warnings to be dismissed...');
    await driver.sleep(1000);
    
    // Try to handle any JavaScript alerts (though password warnings are browser-level)
    try {
        const alert = await driver.switchTo().alert();
        await alert.accept();
        console.log('Alert dismissed automatically');
    } catch (e) {
        // No JavaScript alert present
    }
};

module.exports = { getDriver, login, By, until, Key: require('selenium-webdriver').Key };
