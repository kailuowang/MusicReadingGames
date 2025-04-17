/**
 * Test runner for the MusicReadingGames application
 * 
 * This script will run the Jest test suite for the application.
 * Usage:
 *   node run-tests.js
 * 
 * Options:
 *   --watch: Run tests in watch mode
 *   --coverage: Generate test coverage report
 */

const { execSync } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const watchMode = args.includes('--watch');
const coverage = args.includes('--coverage');

// Build the Jest command
let command = 'npx jest';

if (watchMode) {
  command += ' --watch';
}

if (coverage) {
  command += ' --coverage';
}

// Add the test files to run
command += ' src/tests';

// Add the octave-specific tests
command += ' --testMatch="**/(*OctaveSupport|*Note).test.ts"';

console.log(`Running tests with command: ${command}`);

try {
  // Execute the Jest command
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Error running tests:', error.message);
  process.exit(1);
} 