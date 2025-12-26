// runtime-test.js - Test de charge pour chaque framework
const puppeteer = require('puppeteer');

async function testFormPerformance(url, frameworkName) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Métriques à collecter
  const metrics = {
    framework: frameworkName,
    initialLoad: 0,
    formToggleTime: 0,
    inputResponseTime: 0,
    submitTime: 0,
    memoryUsage: 0
  };

  try {
    // Test 1: Temps de chargement initial
    const startLoad = Date.now();
    await page.goto(url, { waitUntil: 'networkidle0' });
    metrics.initialLoad = Date.now() - startLoad;

    // Test 2: Performance du toggle login/register
    const startToggle = Date.now();
    await page.click('button:contains("S\'inscrire")'); // Adapter selon votre sélecteur
    await page.waitForTimeout(100);
    metrics.formToggleTime = Date.now() - startToggle;

    // Test 3: Temps de réponse des inputs
    const startInput = Date.now();
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'password123');
    metrics.inputResponseTime = Date.now() - startInput;

    // Test 4: Simulation de soumission
    const startSubmit = Date.now();
    await page.click('button[type="submit"], button:contains("S\'inscrire")');
    await page.waitForTimeout(1000); // Attendre la simulation
    metrics.submitTime = Date.now() - startSubmit;

    // Test 5: Utilisation mémoire
    const jsHeapUsage = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    metrics.memoryUsage = jsHeapUsage;

    console.log(` ${frameworkName} performance test completed`);
    
  } catch (error) {
    console.error(` Error testing ${frameworkName}:`, error.message);
  } finally {
    await browser.close();
  }

  return metrics;
}

async function runAllPerformanceTests() {
  const frameworks = [
    { name: 'Next.js', url: 'http://localhost:3000' },
    { name: 'Nuxt', url: 'http://localhost:3000' },
    { name: 'SvelteKit', url: 'http://localhost:5173' }
  ];

  const results = [];
  
  for (const framework of frameworks) {
    console.log(` Testing ${framework.name}...`);
    const result = await testFormPerformance(framework.url, framework.name);
    results.push(result);
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Afficher les résultats
  console.log('\n RUNTIME PERFORMANCE COMPARISON\n');
  console.log('Framework | Load (ms) | Toggle (ms) | Input (ms) | Submit (ms) | Memory (KB)');
  console.log('----------|-----------|-------------|------------|-------------|------------');
  
  results.forEach(result => {
    console.log(
      `${result.framework.padEnd(9)} | ${result.initialLoad.toString().padEnd(9)} | ${result.formToggleTime.toString().padEnd(11)} | ${result.inputResponseTime.toString().padEnd(10)} | ${result.submitTime.toString().padEnd(11)} | ${Math.round(result.memoryUsage / 1024).toString().padEnd(10)}`
    );
  });

  return results;
}

// Exporter pour utilisation
module.exports = { testFormPerformance, runAllPerformanceTests };

// Si appelé directement
if (require.main === module) {
  runAllPerformanceTests().catch(console.error);
}