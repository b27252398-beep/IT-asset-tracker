const puppeteer = require('C:\\scratch\\node_modules\\puppeteer-core');

(async () => {
  console.log("Launching puppeteer...");
  const browser = await puppeteer.launch({ 
    executablePath: 'C:\\Users\\krish.limbachiya_enf\\.cache\\puppeteer\\chrome\\win64-150.0.7871.24\\chrome-win64\\chrome.exe',
    headless: "new"
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE EXCEPTION:', error.message);
  });

  try {
    console.log("Navigating to dashboard...");
    await page.goto('http://localhost:5173/');
    
    console.log("Injecting token to bypass login...");
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake-token-for-testing');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Admin User',
        email: 'admin@itams.com',
        role: 'ADMIN'
      }));
    });
    
    console.log("Navigating to software...");
    await page.goto('http://localhost:5173/software', { waitUntil: 'networkidle0' });
    
    console.log("Clicking Add button...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addButton = buttons.find(b => b.textContent.includes('Add'));
      if (addButton) addButton.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    console.log("Done checking.");
  } catch (err) {
    console.error("Puppeteer Script Error:", err);
  } finally {
    await browser.close();
  }
  console.log("Done.");
})();
