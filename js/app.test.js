/**
 * Test suite for Skull King score calculation
 */

// Test helper function
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

// Test cases
function testCalculateRoundScore() {
  console.log('Running test suite for calculateRoundScore...');
  
  // Test case 1: Bid 3, take 3 = 60 points (20×3)
  let score = calculateRoundScore(3, 3);
  assertEqual(score, 60, 'Bid 3, take 3');
  console.log('✓ Test 1 passed: Bid 3, take 3 = 60 points');
  
  // Test case 2: Bid 2, take 4 = -20 points (-10×2 difference)
  score = calculateRoundScore(2, 4);
  assertEqual(score, -20, 'Bid 2, take 4');
  console.log('✓ Test 2 passed: Bid 2, take 4 = -20 points');
  
  // Test case 3: Bid 1, take 0 = -10 points (-10×1 difference)
  score = calculateRoundScore(1, 0);
  assertEqual(score, -10, 'Bid 1, take 0');
  console.log('✓ Test 3 passed: Bid 1, take 0 = -10 points');
  
  // Additional test cases
  // Test case 4: Bid 0, take 0 = 0 points (exact bid)
  score = calculateRoundScore(0, 0);
  assertEqual(score, 0, 'Bid 0, take 0');
  console.log('✓ Test 4 passed: Bid 0, take 0 = 0 points');
  
  // Test case 5: Bid 5, take 5 = 100 points (20×5)
  score = calculateRoundScore(5, 5);
  assertEqual(score, 100, 'Bid 5, take 5');
  console.log('✓ Test 5 passed: Bid 5, take 5 = 100 points');
  
  // Test case 6: Bid 4, take 2 = -20 points (-10×2 difference)
  score = calculateRoundScore(4, 2);
  assertEqual(score, -20, 'Bid 4, take 2');
  console.log('✓ Test 6 passed: Bid 4, take 2 = -20 points');
  
  console.log('All tests passed! ✓');
}

// Run tests if this file is loaded
if (typeof calculateRoundScore === 'function') {
  testCalculateRoundScore();
}
