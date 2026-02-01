/**
 * Todo App - Manual Test Cases
 * =============================
 *
 * This file documents manual test scenarios for the Todo List application.
 * Execute these tests manually in the browser console or by interacting with the UI.
 *
 * Test Environment Setup:
 * - Open index.html in a modern browser
 * - Open Developer Tools (F12) for console access
 * - Clear localStorage before each test suite: localStorage.clear()
 */

// =============================================================================
// TEST SUITE 1: Basic Functionality
// =============================================================================

/**
 * TEST 1.1: Add a simple todo
 * Steps:
 *   1. Type "Buy groceries" in the input field
 *   2. Click "Add" button or press Enter
 * Expected:
 *   - New todo item appears in the list
 *   - Input field is cleared
 *   - Todo is unchecked by default
 *   - localStorage contains the new todo
 * Verification:
 *   console.log(JSON.parse(localStorage.getItem('todos')));
 *   // Should show: [{text: "Buy groceries", completed: false}]
 */

/**
 * TEST 1.2: Toggle todo completion
 * Precondition: At least one todo exists
 * Steps:
 *   1. Click the checkbox next to a todo item
 * Expected:
 *   - Todo text gets strikethrough styling
 *   - Checkbox becomes checked
 *   - localStorage updated with completed: true
 *   2. Click checkbox again
 * Expected:
 *   - Strikethrough removed
 *   - Checkbox unchecked
 *   - localStorage updated with completed: false
 */

/**
 * TEST 1.3: Delete a todo
 * Precondition: At least one todo exists
 * Steps:
 *   1. Click the "Delete" button on a todo item
 * Expected:
 *   - Todo item is removed from the list
 *   - localStorage updated (item removed from array)
 */

/**
 * TEST 1.4: Persistence across page reload
 * Steps:
 *   1. Add several todos
 *   2. Mark some as complete
 *   3. Refresh the page (F5)
 * Expected:
 *   - All todos are restored
 *   - Completion states are preserved
 */

// =============================================================================
// TEST SUITE 2: Edge Cases - Empty/Whitespace Input
// =============================================================================

/**
 * TEST 2.1: Empty input submission
 * Steps:
 *   1. Leave input field empty
 *   2. Click "Add" button
 * Expected:
 *   - Form validation prevents submission (HTML5 required attribute)
 *   - No empty todo is added
 * PASS: The 'required' attribute on input prevents empty submission
 */

/**
 * TEST 2.2: Whitespace-only input
 * Steps:
 *   1. Type "   " (only spaces) in the input
 *   2. Submit the form
 * Expected:
 *   - No todo should be added (whitespace is trimmed and empty check passes)
 * Verification:
 *   - The code uses input.value.trim() and checks if (text) before adding
 * PASS: Whitespace-only input is properly rejected
 */

/**
 * TEST 2.3: Input with leading/trailing whitespace
 * Steps:
 *   1. Type "  Buy milk  " (with spaces)
 *   2. Submit the form
 * Expected:
 *   - Todo is added with trimmed text "Buy milk"
 * PASS: Text is properly trimmed before storage
 */

// =============================================================================
// TEST SUITE 3: Edge Cases - Long Text
// =============================================================================

/**
 * TEST 3.1: Very long todo text
 * Steps:
 *   1. Type a very long string (500+ characters)
 *   2. Submit the form
 * Expected:
 *   - Todo is added successfully
 *   - Text may overflow but should be handled by CSS
 *
 * ISSUE FOUND: No maximum length validation
 * - Extremely long text could cause UI overflow issues
 * - Could potentially fill localStorage (typically 5MB limit)
 *
 * Test with:
 *   document.getElementById('todo-input').value = 'A'.repeat(10000);
 *   document.getElementById('todo-form').dispatchEvent(new Event('submit'));
 */

/**
 * TEST 3.2: localStorage quota exceeded
 * Steps:
 *   1. Add many todos with very long text until localStorage fills
 * Expected:
 *   - Application should handle QuotaExceededError gracefully
 *
 * ISSUE FOUND: No error handling for localStorage.setItem
 * - saveTodos() does not catch potential exceptions
 * - User gets no feedback if save fails
 */

// =============================================================================
// TEST SUITE 4: Special Characters
// =============================================================================

/**
 * TEST 4.1: HTML special characters
 * Steps:
 *   1. Type "<script>alert('xss')</script>" in input
 *   2. Submit the form
 * Expected:
 *   - Text should be displayed as literal text, not executed
 *
 * PASS: XSS SAFE
 * The code uses textContent (line 23: span.textContent = todo.text)
 * which safely escapes HTML characters. This is the correct approach.
 */

/**
 * TEST 4.2: Unicode and emoji characters
 * Steps:
 *   1. Type "Buy groceries" in input
 *   2. Submit the form
 * Expected:
 *   - Emoji and unicode display correctly
 * PASS: Standard JavaScript string handling supports unicode
 */

/**
 * TEST 4.3: Special JSON characters
 * Steps:
 *   1. Type text with quotes, backslashes: He said "Hello\" there
 *   2. Submit the form
 * Expected:
 *   - Text stored and retrieved correctly
 * PASS: JSON.stringify/parse handle escaping automatically
 */

// =============================================================================
// TEST SUITE 5: localStorage Error Handling
// =============================================================================

/**
 * TEST 5.1: Corrupted localStorage data
 * Steps:
 *   1. Manually set corrupted data:
 *      localStorage.setItem('todos', 'not valid json');
 *   2. Refresh the page
 * Expected:
 *   - Application should handle gracefully
 *
 * ISSUE FOUND: No try-catch around JSON.parse on line 5
 * - If localStorage contains invalid JSON, the app will crash
 * - Error: "Unexpected token ... in JSON at position 0"
 *
 * Test with:
 *   localStorage.setItem('todos', '{invalid json}');
 *   location.reload();
 */

/**
 * TEST 5.2: localStorage unavailable (private browsing)
 * Steps:
 *   1. Open in private/incognito mode where localStorage may be restricted
 *   2. Try to add a todo
 * Expected:
 *   - Application should function (possibly without persistence)
 *
 * ISSUE FOUND: No feature detection for localStorage availability
 */

/**
 * TEST 5.3: Null todos array handling
 * Steps:
 *   1. Set localStorage: localStorage.setItem('todos', 'null');
 *   2. Refresh page
 * Expected:
 *   - Should initialize empty array
 *
 * PARTIAL PASS: The || [] fallback handles null from JSON.parse(null)
 * but JSON.parse('null') returns null which is then handled by || []
 */

// =============================================================================
// TEST SUITE 6: Accessibility Testing
// =============================================================================

/**
 * TEST 6.1: Keyboard navigation
 * Steps:
 *   1. Use Tab to navigate through the interface
 * Expected:
 *   - Should be able to reach input, add button, and all todo items
 *
 * PASS: Native form elements are keyboard accessible
 */

/**
 * TEST 6.2: Screen reader compatibility
 * Issues Found:
 *   - No aria-label on the todo list (<ul id="todo-list">)
 *   - No aria-label on delete buttons (just "Delete" text)
 *   - Checkbox inputs have no associated labels
 *   - No live region announcements when todos are added/removed
 */

/**
 * TEST 6.3: Focus management
 * Steps:
 *   1. Add a todo
 * Expected:
 *   - Focus should remain in a logical position
 *
 * OBSERVATION: Input is cleared but focus is not explicitly managed
 * Focus likely remains on input which is acceptable behavior
 */

/**
 * TEST 6.4: Color contrast
 * Observation:
 *   - Completed todo text (#999) on white background may have insufficient contrast
 *   - Should verify WCAG AA compliance (4.5:1 ratio for normal text)
 */

// =============================================================================
// TEST SUITE 7: Performance Testing
// =============================================================================

/**
 * TEST 7.1: Large number of todos
 * Steps:
 *   1. Add 100+ todos programmatically
 *   2. Observe performance
 *
 * Test with:
 *   for (let i = 0; i < 200; i++) { addTodo('Todo item ' + i); }
 *
 * OBSERVATION:
 *   - Each addTodo call triggers saveTodos() and renderTodos()
 *   - This is O(n) for each operation
 *   - For 200 items, this means 200 localStorage writes
 *   - Could batch operations for better performance
 */

/**
 * TEST 7.2: Render performance
 * Observation:
 *   - renderTodos() clears entire list and rebuilds (list.innerHTML = '')
 *   - This is inefficient for large lists
 *   - Consider using document fragments or virtual DOM for optimization
 */

// =============================================================================
// TEST SUITE 8: Data Integrity
// =============================================================================

/**
 * TEST 8.1: Index-based deletion race condition
 * Scenario:
 *   - Rapid clicking of delete buttons
 *
 * POTENTIAL ISSUE:
 *   - Delete uses array index which could be stale if UI hasn't re-rendered
 *   - However, since JavaScript is single-threaded and renderTodos is
 *     called after each delete, this should be safe in practice
 *
 * RECOMMENDATION: Use unique IDs instead of array indices for robustness
 */

/**
 * TEST 8.2: Toggle with invalid index
 * Test:
 *   toggleTodo(999); // non-existent index
 *
 * ISSUE: No bounds checking
 *   - todos[999] is undefined
 *   - todos[999].completed throws TypeError
 */

/**
 * TEST 8.3: Delete with invalid index
 * Test:
 *   deleteTodo(-1);
 *   deleteTodo(999);
 *
 * OBSERVATION:
 *   - splice with invalid index is safe (no-op or removes from end)
 *   - But this could indicate a bug in calling code
 */

// =============================================================================
// AUTOMATED TEST HELPERS
// =============================================================================

/**
 * Helper function to run basic smoke tests
 * Copy and paste into browser console
 */
function runSmokeTests() {
  console.log('=== Running Smoke Tests ===');

  // Clear state
  localStorage.clear();
  todos = [];
  renderTodos();

  // Test 1: Add todo
  console.log('Test 1: Adding todo...');
  addTodo('Test item 1');
  console.assert(todos.length === 1, 'FAIL: Todo not added');
  console.assert(todos[0].text === 'Test item 1', 'FAIL: Text mismatch');
  console.assert(todos[0].completed === false, 'FAIL: Should be uncompleted');

  // Test 2: Toggle todo
  console.log('Test 2: Toggling todo...');
  toggleTodo(0);
  console.assert(todos[0].completed === true, 'FAIL: Should be completed');

  // Test 3: Delete todo
  console.log('Test 3: Deleting todo...');
  deleteTodo(0);
  console.assert(todos.length === 0, 'FAIL: Todo not deleted');

  // Test 4: Persistence
  console.log('Test 4: Testing persistence...');
  addTodo('Persistent item');
  const stored = JSON.parse(localStorage.getItem('todos'));
  console.assert(stored.length === 1, 'FAIL: Not persisted');
  console.assert(stored[0].text === 'Persistent item', 'FAIL: Persistence mismatch');

  // Test 5: XSS prevention
  console.log('Test 5: Testing XSS prevention...');
  addTodo('<script>alert("xss")</script>');
  const listItems = document.querySelectorAll('#todo-list li');
  const lastItemText = listItems[listItems.length - 1].querySelector('span').textContent;
  console.assert(lastItemText === '<script>alert("xss")</script>', 'FAIL: XSS text not preserved');

  console.log('=== Smoke Tests Complete ===');

  // Cleanup
  localStorage.clear();
  todos = [];
  renderTodos();
}

// To run: Copy runSmokeTests function and call runSmokeTests() in console
