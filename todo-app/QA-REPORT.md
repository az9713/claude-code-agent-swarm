# QA Report - Todo List Application

**QA Agent Review**
**Date:** 2026-01-31
**Files Reviewed:**
- `index.html`
- `styles.css`
- `app.js`

---

## Executive Summary

The Todo List application is a functional, lightweight task management tool. The codebase is clean and follows good practices in several areas, notably XSS prevention. However, there are several bugs, missing error handling scenarios, and accessibility issues that should be addressed before production use.

**Overall Assessment:** Functional with minor to moderate issues

---

## Bugs Found

### BUG-001: Missing JSON.parse Error Handling (Severity: HIGH)

**Location:** `app.js`, line 5

**Code:**
```javascript
let todos = JSON.parse(localStorage.getItem('todos')) || [];
```

**Issue:** If localStorage contains malformed JSON, the application crashes with an unhandled exception.

**Reproduction:**
1. Open browser console
2. Run: `localStorage.setItem('todos', '{invalid json}');`
3. Refresh the page

**Expected:** Application should handle gracefully and initialize with empty array
**Actual:** Uncaught SyntaxError: Unexpected token 'i' in JSON at position 1

**Suggested Fix:**
```javascript
let todos;
try {
  todos = JSON.parse(localStorage.getItem('todos')) || [];
} catch (e) {
  console.error('Failed to parse todos from localStorage:', e);
  todos = [];
}
```

---

### BUG-002: Missing localStorage.setItem Error Handling (Severity: MEDIUM)

**Location:** `app.js`, line 8

**Code:**
```javascript
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}
```

**Issue:** No error handling for QuotaExceededError when localStorage is full.

**Reproduction:**
1. Fill localStorage near its quota limit
2. Try to add a new todo with long text

**Expected:** User should be notified that save failed
**Actual:** Silent failure, user loses data without knowing

**Suggested Fix:**
```javascript
function saveTodos() {
    try {
        localStorage.setItem('todos', JSON.stringify(todos));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Storage is full. Unable to save todo.');
        }
        console.error('Failed to save todos:', e);
    }
}
```

---

### BUG-003: No Input Length Validation (Severity: LOW)

**Location:** `app.js`, line 37

**Issue:** No maximum length limit on todo text input. Users can enter extremely long strings which:
- Could cause UI overflow
- Could fill localStorage quickly
- Could degrade performance

**Suggested Fix:** Add `maxlength` attribute to input in HTML:
```html
<input type="text" id="todo-input" placeholder="Add a new task..." required maxlength="500">
```

---

### BUG-004: No Bounds Checking on Array Operations (Severity: LOW)

**Location:** `app.js`, lines 43-47

**Code:**
```javascript
function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    // ...
}
```

**Issue:** If `toggleTodo()` or `deleteTodo()` is called with an invalid index, it could cause a TypeError.

**Impact:** While unlikely to occur through normal UI interaction (since indices are bound at render time), this could cause issues if functions are called programmatically or if there's a race condition.

---

## Security Analysis

### XSS Prevention: PASS

The application correctly uses `textContent` to set todo text (line 23), which automatically escapes HTML entities. This prevents XSS attacks.

**Verified Safe Code:**
```javascript
const span = document.createElement('span');
span.textContent = todo.text;  // Safe - escapes HTML
```

If the code had used `innerHTML`, it would have been vulnerable:
```javascript
span.innerHTML = todo.text;  // VULNERABLE - do not use
```

### localStorage Data Integrity: NEEDS IMPROVEMENT

- No validation of data structure when loading from localStorage
- Malicious or corrupted data could cause unexpected behavior

---

## Accessibility Issues

### A11Y-001: Missing Form Labels (Severity: MEDIUM)

**Issue:** Checkbox inputs in todo items have no associated `<label>` elements.

**Impact:** Screen reader users cannot identify which todo item a checkbox controls.

**Suggested Fix:**
```javascript
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.id = `todo-checkbox-${index}`;
checkbox.checked = todo.completed;
checkbox.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`);
```

---

### A11Y-002: No ARIA Live Region (Severity: LOW)

**Issue:** When todos are added or removed, screen reader users receive no notification.

**Suggested Fix:** Add an aria-live region for announcements:
```html
<div aria-live="polite" id="announcements" class="sr-only"></div>
```

---

### A11Y-003: Insufficient Color Contrast (Severity: MEDIUM)

**Location:** `styles.css`, line 94

**Code:**
```css
.todo-item.completed span {
    text-decoration: line-through;
    color: #999;
}
```

**Issue:** Gray text (#999) on white background has a contrast ratio of approximately 2.85:1, which fails WCAG AA requirements (minimum 4.5:1 for normal text).

**Suggested Fix:** Use a darker gray:
```css
.todo-item.completed span {
    text-decoration: line-through;
    color: #666;  /* 5.74:1 contrast ratio */
}
```

---

### A11Y-004: Delete Button Needs Context (Severity: LOW)

**Issue:** Delete buttons all have the same text "Delete" with no context about which item they delete.

**Suggested Fix:**
```javascript
deleteBtn.setAttribute('aria-label', `Delete "${todo.text}"`);
```

---

## Suggested Improvements

### 1. Add Unique IDs to Todos

Instead of using array indices (which can cause issues), assign unique IDs:
```javascript
function addTodo(text) {
    todos.push({
        id: Date.now(), // Simple unique ID
        text,
        completed: false
    });
    // ...
}
```

### 2. Implement Feature Detection for localStorage

```javascript
function isLocalStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}
```

### 3. Add Empty State Message

When there are no todos, display a helpful message:
```javascript
function renderTodos() {
    list.innerHTML = '';
    if (todos.length === 0) {
        list.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
        return;
    }
    // ... rest of render logic
}
```

### 4. Batch DOM Updates

For better performance with many todos, use DocumentFragment:
```javascript
function renderTodos() {
    const fragment = document.createDocumentFragment();
    todos.forEach((todo, index) => {
        // ... create li element
        fragment.appendChild(li);
    });
    list.innerHTML = '';
    list.appendChild(fragment);
}
```

### 5. Add Confirmation for Delete

Consider adding confirmation for delete actions to prevent accidental data loss.

### 6. Add Edit Functionality

Allow users to edit existing todos instead of deleting and re-creating them.

---

## Test Scenarios That Should Pass

### Basic Functionality
| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| T-001 | Add a new todo | Todo appears in list, input cleared | PASS |
| T-002 | Mark todo as complete | Checkbox checked, text strikethrough | PASS |
| T-003 | Mark todo as incomplete | Checkbox unchecked, strikethrough removed | PASS |
| T-004 | Delete a todo | Todo removed from list | PASS |
| T-005 | Refresh page | All todos persist | PASS |

### Input Validation
| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| T-006 | Submit empty input | Form validation prevents submission | PASS |
| T-007 | Submit whitespace only | No todo added | PASS |
| T-008 | Submit with leading/trailing spaces | Text trimmed before save | PASS |

### Security
| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| T-009 | Enter HTML tags as text | Tags displayed as text, not rendered | PASS |
| T-010 | Enter script tags | Script not executed | PASS |

### Edge Cases
| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| T-011 | Corrupted localStorage JSON | App initializes with empty array | FAIL |
| T-012 | localStorage full | User notified, app continues | FAIL |
| T-013 | Very long todo text (500+ chars) | Text accepted, UI handles overflow | PASS* |

*Note: T-013 passes but no length limit exists, which is not ideal.

### Accessibility
| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| T-014 | Keyboard navigation | All elements reachable via Tab | PASS |
| T-015 | Screen reader announces todo text | Todo items are readable | PARTIAL |
| T-016 | Color contrast meets WCAG AA | 4.5:1 ratio minimum | FAIL |

---

## Files Created During QA

1. `tests.js` - Manual test cases with detailed reproduction steps
2. `QA-REPORT.md` - This document

---

## Conclusion

The Todo List application is a solid implementation with clean, readable code. The critical issue to address is the missing error handling for JSON.parse (BUG-001), which could crash the application. The accessibility issues (particularly color contrast) should also be addressed for inclusive design.

**Priority Fix Order:**
1. BUG-001 - JSON.parse error handling (HIGH)
2. A11Y-003 - Color contrast (MEDIUM)
3. BUG-002 - localStorage.setItem error handling (MEDIUM)
4. A11Y-001 - Form labels for checkboxes (MEDIUM)
5. BUG-003 - Input length validation (LOW)
