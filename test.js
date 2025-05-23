// test.js
const fs = require('fs');
const path = require('path');

// Load test data
let testData;
try {
  testData = require('./test-data.json');
  console.log(`📁 Loaded ${testData.length} test items`);
} catch (error) {
  console.error('❌ Could not load test-data.json');
  console.error('Please create test-data.json with your LinkedIn profile data');
  process.exit(1);
}

// Test the API
async function runTest() {
  const server = `http://localhost:3000`;
  
  try {
    console.log('🧪 Testing API...');
    
    const response = await fetch(`${server}/api/process-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ Test successful!');
    console.log(`📊 Processed: ${result.metadata.processed} profiles`);
    console.log(`⏱️  Processing time: ${result.metadata.processingTimeMs}ms`);
    
    // Save output for comparison
    fs.writeFileSync('test-output.json', JSON.stringify(result.items, null, 2));
    console.log('💾 Output saved to test-output.json');
    
    // Show first result summary
    if (result.items.length > 0) {
      const first = result.items[0].json;
      console.log('\n📋 First profile summary:');
      console.log(`   Name: ${first.firstname} ${first.lastname}`);
      console.log(`   Company: ${first.current_company}`);
      console.log(`   Title: ${first.current_job_title}`);
      console.log(`   Experience: ${first.years_of_experience} years`);
      console.log(`   Keywords count: ${first.keywords.split(' ').length}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      await runTest();
    } else {
      throw new Error('Server not healthy');
    }
  } catch (error) {
    console.error('❌ Server not running. Start it with: npm run dev');
    process.exit(1);
  }
}

checkServer();