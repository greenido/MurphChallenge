/**
 * Murph Challenge Tracker - Test Suite
 * 
 * Simple browser-based tests for the core functionality.
 * Run by opening test.html in a browser.
 */

const TestRunner = {
  results: [],
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,

  /**
   * Run a single test
   */
  test(name, fn) {
    this.totalTests++;
    try {
      fn();
      this.passedTests++;
      this.results.push({ name, passed: true });
      console.log(`✅ PASS: ${name}`);
    } catch (error) {
      this.failedTests++;
      this.results.push({ name, passed: false, error: error.message });
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${error.message}`);
    }
  },

  /**
   * Assert equality
   */
  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message} Expected: ${expected}, Got: ${actual}`);
    }
  },

  /**
   * Assert deep equality for objects/arrays
   */
  assertDeepEqual(actual, expected, message = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message} Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
    }
  },

  /**
   * Assert truthy value
   */
  assertTrue(value, message = '') {
    if (!value) {
      throw new Error(`${message} Expected truthy value, got: ${value}`);
    }
  },

  /**
   * Assert falsy value
   */
  assertFalse(value, message = '') {
    if (value) {
      throw new Error(`${message} Expected falsy value, got: ${value}`);
    }
  },

  /**
   * Assert value is defined
   */
  assertDefined(value, message = '') {
    if (value === undefined || value === null) {
      throw new Error(`${message} Expected defined value, got: ${value}`);
    }
  },

  /**
   * Assert array has length
   */
  assertLength(arr, length, message = '') {
    if (!Array.isArray(arr)) {
      throw new Error(`${message} Expected array, got: ${typeof arr}`);
    }
    if (arr.length !== length) {
      throw new Error(`${message} Expected length ${length}, got: ${arr.length}`);
    }
  },

  /**
   * Print summary
   */
  summary() {
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests} ✅`);
    console.log(`Failed: ${this.failedTests} ❌`);
    console.log(`Pass Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
    
    return {
      total: this.totalTests,
      passed: this.passedTests,
      failed: this.failedTests,
      results: this.results
    };
  },

  /**
   * Reset test state
   */
  reset() {
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }
};

// =============================================================================
// TIMER MODULE TESTS
// =============================================================================

function runTimerTests() {
  console.log('\n📦 TIMER MODULE TESTS');
  console.log('-'.repeat(40));

  // Timer.format() tests
  TestRunner.test('Timer.format - formats 0ms correctly', () => {
    TestRunner.assertEqual(Timer.format(0), '00:00:00');
  });

  TestRunner.test('Timer.format - formats seconds correctly', () => {
    TestRunner.assertEqual(Timer.format(5000), '00:00:05');
  });

  TestRunner.test('Timer.format - formats minutes correctly', () => {
    TestRunner.assertEqual(Timer.format(65000), '00:01:05');
  });

  TestRunner.test('Timer.format - formats hours correctly', () => {
    TestRunner.assertEqual(Timer.format(3661000), '01:01:01');
  });

  TestRunner.test('Timer.format - formats large values correctly', () => {
    TestRunner.assertEqual(Timer.format(7265000), '02:01:05');
  });

  TestRunner.test('Timer.format - pads single digits with zeros', () => {
    TestRunner.assertEqual(Timer.format(61000), '00:01:01');
  });

  // Timer.getElapsed() tests
  TestRunner.test('Timer.getElapsed - returns 0 when timer disabled', () => {
    const state = { timerEnabled: false, elapsedTime: 5000 };
    TestRunner.assertEqual(Timer.getElapsed(state), 0);
  });

  TestRunner.test('Timer.getElapsed - returns elapsedTime when paused', () => {
    const state = { timerEnabled: true, isPaused: true, elapsedTime: 5000 };
    TestRunner.assertEqual(Timer.getElapsed(state), 5000);
  });

  TestRunner.test('Timer.getElapsed - returns elapsedTime when no startTime', () => {
    const state = { timerEnabled: true, isPaused: false, startTime: null, elapsedTime: 5000 };
    TestRunner.assertEqual(Timer.getElapsed(state), 5000);
  });

  // Timer.start() tests
  TestRunner.test('Timer.start - returns state unchanged when timer disabled', () => {
    const state = { timerEnabled: false };
    const result = Timer.start(state, () => {});
    TestRunner.assertFalse(result.timerEnabled);
    Timer.stop(); // Cleanup
  });

  TestRunner.test('Timer.start - sets startTime when enabled', () => {
    const state = { timerEnabled: true, elapsedTime: 0 };
    const before = Date.now();
    const result = Timer.start(state, () => {});
    const after = Date.now();
    TestRunner.assertTrue(result.startTime >= before && result.startTime <= after);
    TestRunner.assertFalse(result.isPaused);
    Timer.stop(); // Cleanup
  });

  // Timer.pause() tests
  TestRunner.test('Timer.pause - sets isPaused to true', () => {
    const state = { timerEnabled: true, isPaused: false, startTime: Date.now(), elapsedTime: 0 };
    const result = Timer.pause(state);
    TestRunner.assertTrue(result.isPaused);
    TestRunner.assertEqual(result.startTime, null);
  });

  TestRunner.test('Timer.pause - returns unchanged when already paused', () => {
    const state = { timerEnabled: true, isPaused: true, elapsedTime: 5000 };
    const result = Timer.pause(state);
    TestRunner.assertEqual(result.elapsedTime, 5000);
  });

  TestRunner.test('Timer.pause - returns unchanged when timer disabled', () => {
    const state = { timerEnabled: false, isPaused: false };
    const result = Timer.pause(state);
    TestRunner.assertFalse(result.timerEnabled);
  });

  // Timer.reset() tests
  TestRunner.test('Timer.reset - resets all timer values', () => {
    const result = Timer.reset();
    TestRunner.assertEqual(result.startTime, null);
    TestRunner.assertEqual(result.elapsedTime, 0);
    TestRunner.assertFalse(result.isPaused);
  });
}

// =============================================================================
// STORAGE MODULE TESTS
// =============================================================================

function runStorageTests() {
  console.log('\n📦 STORAGE MODULE TESTS');
  console.log('-'.repeat(40));

  // Clear any existing test data
  localStorage.removeItem(Storage.WORKOUT_KEY);
  localStorage.removeItem(Storage.THEME_KEY);

  // Storage.getDefaultState() tests
  TestRunner.test('Storage.getDefaultState - returns correct structure for full Murph', () => {
    const state = Storage.getDefaultState('full');
    TestRunner.assertDefined(state.sections);
    TestRunner.assertLength(state.sections, 5);
    TestRunner.assertFalse(state.isHalfMurph);
    TestRunner.assertEqual(state.workoutMode, 'full');
  });

  TestRunner.test('Storage.getDefaultState - has correct exercise totals for full Murph', () => {
    const state = Storage.getDefaultState('full');
    const pullups = state.sections.find(s => s.id === 'pullups');
    const pushups = state.sections.find(s => s.id === 'pushups');
    const squats = state.sections.find(s => s.id === 'squats');
    
    TestRunner.assertEqual(pullups.total, 100);
    TestRunner.assertEqual(pushups.total, 200);
    TestRunner.assertEqual(squats.total, 300);
  });

  TestRunner.test('Storage.getDefaultState - returns correct structure for half Murph', () => {
    const state = Storage.getDefaultState('half');
    TestRunner.assertTrue(state.isHalfMurph);
    TestRunner.assertEqual(state.workoutMode, 'half');
  });

  TestRunner.test('Storage.getDefaultState - has correct exercise totals for half Murph', () => {
    const state = Storage.getDefaultState('half');
    const pullups = state.sections.find(s => s.id === 'pullups');
    const pushups = state.sections.find(s => s.id === 'pushups');
    const squats = state.sections.find(s => s.id === 'squats');
    
    TestRunner.assertEqual(pullups.total, 50);
    TestRunner.assertEqual(pushups.total, 100);
    TestRunner.assertEqual(squats.total, 150);
  });

  TestRunner.test('Storage.getDefaultState - returns correct structure for quarter Murph', () => {
    const state = Storage.getDefaultState('quarter');
    TestRunner.assertTrue(state.isQuarterMurph);
    TestRunner.assertEqual(state.workoutMode, 'quarter');
  });

  TestRunner.test('Storage.getDefaultState - has correct exercise totals for quarter Murph', () => {
    const state = Storage.getDefaultState('quarter');
    const pullups = state.sections.find(s => s.id === 'pullups');
    const pushups = state.sections.find(s => s.id === 'pushups');
    const squats = state.sections.find(s => s.id === 'squats');
    
    TestRunner.assertEqual(pullups.total, 25);
    TestRunner.assertEqual(pushups.total, 50);
    TestRunner.assertEqual(squats.total, 75);
  });

  TestRunner.test('Storage.getDefaultState - has two run sections', () => {
    const state = Storage.getDefaultState('full');
    const runs = state.sections.filter(s => s.type === 'checkbox');
    TestRunner.assertLength(runs, 2);
  });

  TestRunner.test('Storage.getDefaultState - runs have correct names for full Murph', () => {
    const state = Storage.getDefaultState('full');
    const run1 = state.sections.find(s => s.id === 'run1');
    const run2 = state.sections.find(s => s.id === 'run2');
    
    TestRunner.assertEqual(run1.name, 'Mile Run #1');
    TestRunner.assertEqual(run2.name, 'Mile Run #2');
  });

  TestRunner.test('Storage.getDefaultState - runs have correct names for half Murph', () => {
    const state = Storage.getDefaultState('half');
    const run1 = state.sections.find(s => s.id === 'run1');
    const run2 = state.sections.find(s => s.id === 'run2');
    
    TestRunner.assertEqual(run1.name, 'Half Mile Run #1');
    TestRunner.assertEqual(run2.name, 'Half Mile Run #2');
  });

  TestRunner.test('Storage.getDefaultState - runs have correct names for quarter Murph', () => {
    const state = Storage.getDefaultState('quarter');
    const run1 = state.sections.find(s => s.id === 'run1');
    const run2 = state.sections.find(s => s.id === 'run2');
    
    TestRunner.assertEqual(run1.name, 'Quarter Mile Run #1');
    TestRunner.assertEqual(run2.name, 'Quarter Mile Run #2');
  });

  TestRunner.test('Storage.getDefaultState - all sections start at 0', () => {
    const state = Storage.getDefaultState('full');
    state.sections.forEach(section => {
      if (section.type === 'reps') {
        TestRunner.assertEqual(section.completed, 0, `${section.name} should start at 0`);
      } else {
        TestRunner.assertFalse(section.completed, `${section.name} should start incomplete`);
      }
    });
  });

  TestRunner.test('Storage.getDefaultState - has all required fields', () => {
    const state = Storage.getDefaultState('full');
    TestRunner.assertDefined(state.timerEnabled);
    TestRunner.assertDefined(state.isHalfMurph);
    TestRunner.assertDefined(state.workoutMode);
    TestRunner.assertTrue('startTime' in state, 'startTime should exist in state');
    TestRunner.assertDefined(state.elapsedTime);
    TestRunner.assertDefined(state.isPaused);
    TestRunner.assertDefined(state.isComplete);
  });

  // Storage.saveWorkout() and loadWorkout() tests
  TestRunner.test('Storage.saveWorkout - saves state to localStorage', () => {
    const state = Storage.getDefaultState('full');
    const result = Storage.saveWorkout(state);
    TestRunner.assertTrue(result);
  });

  TestRunner.test('Storage.loadWorkout - loads saved state', () => {
    const state = Storage.getDefaultState('full');
    state.sections[1].completed = 50; // Add some progress
    Storage.saveWorkout(state);
    
    const loaded = Storage.loadWorkout();
    TestRunner.assertDefined(loaded);
    TestRunner.assertEqual(loaded.sections[1].completed, 50);
  });

  TestRunner.test('Storage.loadWorkout - returns null for invalid data', () => {
    localStorage.setItem(Storage.WORKOUT_KEY, 'invalid json{');
    const loaded = Storage.loadWorkout();
    TestRunner.assertEqual(loaded, null);
  });

  TestRunner.test('Storage.loadWorkout - returns null for missing sections', () => {
    localStorage.setItem(Storage.WORKOUT_KEY, JSON.stringify({ foo: 'bar' }));
    const loaded = Storage.loadWorkout();
    TestRunner.assertEqual(loaded, null);
  });

  // Storage.hasActiveWorkout() tests
  TestRunner.test('Storage.hasActiveWorkout - returns false for no saved data', () => {
    Storage.clearWorkout();
    TestRunner.assertFalse(Storage.hasActiveWorkout());
  });

  TestRunner.test('Storage.hasActiveWorkout - returns false for fresh workout', () => {
    const state = Storage.getDefaultState('full');
    Storage.saveWorkout(state);
    TestRunner.assertFalse(Storage.hasActiveWorkout());
  });

  TestRunner.test('Storage.hasActiveWorkout - returns true for in-progress workout', () => {
    const state = Storage.getDefaultState('full');
    state.sections[1].completed = 50;
    Storage.saveWorkout(state);
    TestRunner.assertTrue(Storage.hasActiveWorkout());
  });

  TestRunner.test('Storage.hasActiveWorkout - returns false for completed workout', () => {
    const state = Storage.getDefaultState('full');
    state.sections[1].completed = 50;
    state.isComplete = true;
    Storage.saveWorkout(state);
    TestRunner.assertFalse(Storage.hasActiveWorkout());
  });

  TestRunner.test('Storage.hasActiveWorkout - returns true when run is completed', () => {
    const state = Storage.getDefaultState('full');
    state.sections[0].completed = true; // First run
    Storage.saveWorkout(state);
    TestRunner.assertTrue(Storage.hasActiveWorkout());
  });

  // Storage.clearWorkout() tests
  TestRunner.test('Storage.clearWorkout - removes saved workout', () => {
    const state = Storage.getDefaultState('full');
    Storage.saveWorkout(state);
    TestRunner.assertTrue(Storage.clearWorkout());
    TestRunner.assertEqual(Storage.loadWorkout(), null);
  });

  // Storage theme tests
  TestRunner.test('Storage.saveTheme - saves dark theme', () => {
    Storage.saveTheme(true);
    TestRunner.assertTrue(Storage.loadTheme());
  });

  TestRunner.test('Storage.saveTheme - saves light theme', () => {
    Storage.saveTheme(false);
    TestRunner.assertFalse(Storage.loadTheme());
  });

  // Cleanup
  localStorage.removeItem(Storage.WORKOUT_KEY);
  localStorage.removeItem(Storage.THEME_KEY);
}

// =============================================================================
// APP MODULE TESTS (Unit Tests for Helper Functions)
// =============================================================================

function runAppTests() {
  console.log('\n📦 APP MODULE TESTS');
  console.log('-'.repeat(40));

  // Test isWorkoutComplete logic
  TestRunner.test('App.isWorkoutComplete - returns false for fresh workout', () => {
    App.state = Storage.getDefaultState('full');
    TestRunner.assertFalse(App.isWorkoutComplete());
  });

  TestRunner.test('App.isWorkoutComplete - returns false for partial workout', () => {
    App.state = Storage.getDefaultState('full');
    App.state.sections[0].completed = true;
    App.state.sections[1].completed = 100;
    TestRunner.assertFalse(App.isWorkoutComplete());
  });

  TestRunner.test('App.isWorkoutComplete - returns true for completed full Murph', () => {
    App.state = Storage.getDefaultState('full');
    App.state.sections[0].completed = true;  // Run 1
    App.state.sections[1].completed = 100;   // Pull-ups
    App.state.sections[2].completed = 200;   // Push-ups
    App.state.sections[3].completed = 300;   // Squats
    App.state.sections[4].completed = true;  // Run 2
    TestRunner.assertTrue(App.isWorkoutComplete());
  });

  TestRunner.test('App.isWorkoutComplete - returns true for completed half Murph', () => {
    App.state = Storage.getDefaultState('half');
    App.state.sections[0].completed = true;  // Run 1
    App.state.sections[1].completed = 50;    // Pull-ups
    App.state.sections[2].completed = 100;   // Push-ups
    App.state.sections[3].completed = 150;   // Squats
    App.state.sections[4].completed = true;  // Run 2
    TestRunner.assertTrue(App.isWorkoutComplete());
  });

  TestRunner.test('App.isWorkoutComplete - returns true for completed quarter Murph', () => {
    App.state = Storage.getDefaultState('quarter');
    App.state.sections[0].completed = true;  // Run 1
    App.state.sections[1].completed = 25;    // Pull-ups
    App.state.sections[2].completed = 50;    // Push-ups
    App.state.sections[3].completed = 75;    // Squats
    App.state.sections[4].completed = true;  // Run 2
    TestRunner.assertTrue(App.isWorkoutComplete());
  });

  // Test generateStatsText
  TestRunner.test('App.generateStatsText - includes workout type for full Murph', () => {
    App.state = Storage.getDefaultState('full');
    App.state.timerEnabled = true;
    App.state.elapsedTime = 3661000; // 1:01:01
    const text = App.generateStatsText();
    TestRunner.assertTrue(text.includes('Murph Challenge'));
  });

  TestRunner.test('App.generateStatsText - includes workout type for half Murph', () => {
    App.state = Storage.getDefaultState('half');
    App.state.timerEnabled = true;
    App.state.elapsedTime = 1800000;
    const text = App.generateStatsText();
    TestRunner.assertTrue(text.includes('Half Murph'));
  });

  TestRunner.test('App.generateStatsText - includes workout type for quarter Murph', () => {
    App.state = Storage.getDefaultState('quarter');
    App.state.timerEnabled = true;
    App.state.elapsedTime = 900000;
    const text = App.generateStatsText();
    TestRunner.assertTrue(text.includes('Quarter Murph'));
  });

  TestRunner.test('App.generateStatsText - includes time when timer enabled', () => {
    App.state = Storage.getDefaultState('full');
    App.state.timerEnabled = true;
    App.state.elapsedTime = 3661000;
    const text = App.generateStatsText();
    TestRunner.assertTrue(text.includes('01:01:01'));
  });

  TestRunner.test('App.generateStatsText - shows "No timer" when timer disabled', () => {
    App.state = Storage.getDefaultState('full');
    App.state.timerEnabled = false;
    const text = App.generateStatsText();
    TestRunner.assertTrue(text.includes('No timer'));
  });

  TestRunner.test('App.generateStatsText - includes total reps', () => {
    App.state = Storage.getDefaultState('full');
    App.state.sections[1].completed = 50;
    App.state.sections[2].completed = 100;
    App.state.sections[3].completed = 150;
    const text = App.generateStatsText();
    TestRunner.assertTrue(text.includes('Total Reps: 300'));
  });

  TestRunner.test('App.generateStatsText - includes tribute message', () => {
    App.state = Storage.getDefaultState('full');
    const text = App.generateStatsText();
    TestRunner.assertTrue(text.includes('Lt. Michael P. Murphy'));
  });

  // Cleanup
  App.state = null;
}

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

function runIntegrationTests() {
  console.log('\n📦 INTEGRATION TESTS');
  console.log('-'.repeat(40));

  // Clear any existing data
  Storage.clearWorkout();

  // Test addReps functionality
  TestRunner.test('addReps - adds correct amount to section', () => {
    App.state = Storage.getDefaultState('full');
    const initialCompleted = App.state.sections[1].completed;
    
    // Simulate addReps logic
    const section = App.state.sections.find(s => s.id === 'pullups');
    const amount = 10;
    const remaining = section.total - section.completed;
    const actualAmount = Math.min(amount, remaining);
    section.lastAction = actualAmount;
    section.completed += actualAmount;
    
    TestRunner.assertEqual(App.state.sections[1].completed, initialCompleted + 10);
  });

  TestRunner.test('addReps - caps at maximum total', () => {
    App.state = Storage.getDefaultState('full');
    const section = App.state.sections.find(s => s.id === 'pullups');
    section.completed = 95;
    
    // Simulate addReps with amount that exceeds max
    const amount = 10;
    const remaining = section.total - section.completed;
    const actualAmount = Math.min(amount, remaining);
    section.lastAction = actualAmount;
    section.completed += actualAmount;
    
    TestRunner.assertEqual(section.completed, 100);
    TestRunner.assertEqual(section.lastAction, 5); // Only 5 were actually added
  });

  // Test undoReps functionality
  TestRunner.test('undoReps - removes last action amount', () => {
    App.state = Storage.getDefaultState('full');
    const section = App.state.sections.find(s => s.id === 'pullups');
    section.completed = 20;
    section.lastAction = 10;
    
    // Simulate undoReps logic
    section.completed = Math.max(0, section.completed - section.lastAction);
    section.lastAction = null;
    
    TestRunner.assertEqual(section.completed, 10);
    TestRunner.assertEqual(section.lastAction, null);
  });

  TestRunner.test('undoReps - does not go below 0', () => {
    App.state = Storage.getDefaultState('full');
    const section = App.state.sections.find(s => s.id === 'pullups');
    section.completed = 5;
    section.lastAction = 10;
    
    // Simulate undoReps logic
    section.completed = Math.max(0, section.completed - section.lastAction);
    section.lastAction = null;
    
    TestRunner.assertEqual(section.completed, 0);
  });

  // Test toggleRun functionality
  TestRunner.test('toggleRun - toggles run completion', () => {
    App.state = Storage.getDefaultState('full');
    const section = App.state.sections.find(s => s.id === 'run1');
    
    TestRunner.assertFalse(section.completed);
    
    section.completed = !section.completed;
    TestRunner.assertTrue(section.completed);
    
    section.completed = !section.completed;
    TestRunner.assertFalse(section.completed);
  });

  // Test overall progress calculation
  TestRunner.test('Progress calculation - calculates percentage correctly', () => {
    App.state = Storage.getDefaultState('full');
    
    // Full Murph: 2 runs (1 each) + 100 pullups + 200 pushups + 300 squats = 602 total
    let completed = 0;
    let total = 0;
    
    App.state.sections.forEach(section => {
      if (section.type === 'checkbox') {
        total += 1;
        completed += section.completed ? 1 : 0;
      } else {
        total += section.total;
        completed += section.completed;
      }
    });
    
    TestRunner.assertEqual(total, 602);
    TestRunner.assertEqual(completed, 0);
  });

  TestRunner.test('Progress calculation - updates with progress', () => {
    App.state = Storage.getDefaultState('full');
    App.state.sections[0].completed = true;   // Run 1
    App.state.sections[1].completed = 50;     // Half pullups
    
    let completed = 0;
    let total = 0;
    
    App.state.sections.forEach(section => {
      if (section.type === 'checkbox') {
        total += 1;
        completed += section.completed ? 1 : 0;
      } else {
        total += section.total;
        completed += section.completed;
      }
    });
    
    TestRunner.assertEqual(completed, 51); // 1 + 50
    const percentage = Math.round((completed / total) * 100);
    TestRunner.assertEqual(percentage, 8); // ~8.5% rounds to 8
  });

  // Test quarter Murph progress
  TestRunner.test('Progress calculation - quarter Murph totals', () => {
    App.state = Storage.getDefaultState('quarter');
    
    // Quarter Murph: 2 runs (1 each) + 25 pullups + 50 pushups + 75 squats = 152 total
    let total = 0;
    
    App.state.sections.forEach(section => {
      if (section.type === 'checkbox') {
        total += 1;
      } else {
        total += section.total;
      }
    });
    
    TestRunner.assertEqual(total, 152);
  });

  // Cleanup
  App.state = null;
  Storage.clearWorkout();
}

// =============================================================================
// RUN ALL TESTS
// =============================================================================

function runAllTests() {
  console.log('🏋️ MURPH CHALLENGE TRACKER - TEST SUITE');
  console.log('='.repeat(50));
  console.log('Starting tests...\n');

  TestRunner.reset();

  runTimerTests();
  runStorageTests();
  runAppTests();
  runIntegrationTests();

  return TestRunner.summary();
}

// Export for browser use
window.TestRunner = TestRunner;
window.runAllTests = runAllTests;
window.runTimerTests = runTimerTests;
window.runStorageTests = runStorageTests;
window.runAppTests = runAppTests;
window.runIntegrationTests = runIntegrationTests;
