# COBOL Student Account Management System - Test Plan

## Overview
This document outlines comprehensive test cases for the COBOL Account Management System covering all business logic, user interactions, and edge cases.

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | View initial account balance | Application started | 1. Select menu option 1 (View Balance) | Display current balance of 1000.00 | | | |
| TC-002 | Credit valid amount | Application started with balance of 1000.00 | 1. Select option 2 (Credit Account)<br>2. Enter amount: 500 | Display new balance of 1500.00 | | | |
| TC-003 | Credit small amount | Application started with balance of 1000.00 | 1. Select option 2 (Credit Account)<br>2. Enter amount: 1 | Display new balance of 1001.00 | | | |
| TC-004 | Credit large amount | Application started with balance of 1000.00 | 1. Select option 2 (Credit Account)<br>2. Enter amount: 999000 | Display new balance of 1000000.00 (or error if exceeds limit) | | | Validates maximum balance constraint |
| TC-005 | Credit with decimal precision | Application started with balance of 1000.00 | 1. Select option 2 (Credit Account)<br>2. Enter amount: 250.50 | Display new balance of 1250.50 with 2 decimal places | | | Validates decimal handling |
| TC-006 | Debit valid amount (sufficient funds) | Application started with balance of 1000.00 | 1. Select option 3 (Debit Account)<br>2. Enter amount: 300 | Display new balance of 700.00 | | | |
| TC-007 | Debit small amount | Application started with balance of 1000.00 | 1. Select option 3 (Debit Account)<br>2. Enter amount: 1 | Display new balance of 999.00 | | | |
| TC-008 | Debit exact balance amount | Application started with balance of 1000.00 | 1. Select option 3 (Debit Account)<br>2. Enter amount: 1000 | Display new balance of 0.00 | | | Validates minimum balance edge case |
| TC-009 | Debit exceeding balance (insufficient funds) | Application started with balance of 500.00 | 1. Select option 3 (Debit Account)<br>2. Enter amount: 600 | Display error message "Insufficient funds for this debit." and balance remains 500.00 | | | Overdraft prevention validation |
| TC-010 | Debit with insufficient funds - retry | Application started with balance of 500.00 | 1. Select option 3 (Debit Account)<br>2. Enter amount: 600<br>3. System shows error<br>4. Menu returns<br>5. Select option 3 again<br>6. Enter amount: 300 | Step 2: Error message shown, balance 500.00<br>Step 6: Debit successful, new balance 200.00 | | | Validates state persistence after failed debit |
| TC-011 | Invalid menu choice - letter input | Application started | 1. Select option A (invalid) | Display "Invalid choice, please select 1-4." and return to menu | | | |
| TC-012 | Invalid menu choice - out of range | Application started | 1. Select option 5 (out of range) | Display "Invalid choice, please select 1-4." and return to menu | | | |
| TC-013 | Invalid menu choice - zero | Application started | 1. Select option 0 | Display "Invalid choice, please select 1-4." and return to menu | | | |
| TC-014 | Exit program normally | Application started | 1. Select option 4 (Exit) | Display "Exiting the program. Goodbye!" and program terminates | | | |
| TC-015 | Sequential operations - credit then debit | Application started with balance of 1000.00 | 1. Select option 2 (Credit)<br>2. Enter 500<br>3. View balance (option 1)<br>4. Select option 3 (Debit)<br>5. Enter 200 | Balance after credit: 1500.00<br>Balance after debit: 1300.00 | | | Validates state persistence across operations |
| TC-016 | Multiple credits in sequence | Application started with balance of 1000.00 | 1. Credit 100<br>2. Credit 200<br>3. Credit 150<br>4. View balance | Balance progression: 1100.00 → 1300.00 → 1450.00 | | | |
| TC-017 | Multiple debits in sequence | Application started with balance of 1000.00 | 1. Debit 100<br>2. Debit 200<br>3. Debit 150<br>4. View balance | Balance progression: 900.00 → 700.00 → 550.00 | | | |
| TC-018 | Mixed operations - credit, debit, credit, debit | Application started with balance of 1000.00 | 1. Credit 300 (→1300)<br>2. Debit 400 (→900)<br>3. Credit 200 (→1100)<br>4. Debit 150 (→950) | Final balance: 950.00 | | | |
| TC-019 | View balance multiple times | Application started with balance of 1000.00 | 1. View balance<br>2. View balance<br>3. View balance<br>4. View balance | All displays show 1000.00 (no state change) | | | |
| TC-020 | Menu loop returns correctly after operation | Application started | 1. Select any operation<br>2. Complete operation<br>3. Verify menu displays | Menu displays after each operation completion | | | |
| TC-021 | Balance precision after calculation | Application started with balance of 1000.00 | 1. Credit 0.50<br>2. Credit 0.25<br>3. View balance | Balance shows 1000.75 with exactly 2 decimal places | | | Validates decimal precision |
| TC-022 | Debit attempt with exact remaining balance | Application started with balance of 500.00 | 1. Debit 500.00 | Success, new balance: 0.00 | | | Boundary condition: minimum balance |
| TC-023 | Debit attempt with 1 cent over balance | Application started with balance of 100.00 | 1. Debit 100.01 | Error "Insufficient funds for this debit." | | | Boundary condition: overdraft prevention |
| TC-024 | Large balance accumulated | Application started with balance of 1000.00 | 1. Credit 999000<br>2. View balance | Display new balance (error handling depends on max limit) | | | Validates large number handling |
| TC-025 | Session persistence - multiple transactions | Application started | 1. Credit 100<br>2. Debit 50<br>3. View balance<br>4. Credit 75<br>5. View balance | After step 3: 1050.00<br>After step 5: 1125.00 | | | |

---

## Test Execution Notes

### Preconditions for All Tests
- COBOL application successfully compiled without errors
- Application executable (`accountsystem`) available in project root
- System started with default balance of 1000.00

### Test Data Constraints
- Balance range: 0.00 to 999,999.99
- Decimal precision: 2 places
- Input type: Numeric only for amounts
- Menu choices: 1-4 (numeric)

### Boundary Values
- **Minimum balance:** 0.00
- **Maximum balance:** 999,999.99
- **Minimum transaction:** 0.01
- **Maximum transaction:** 999,999.99

### Edge Cases to Verify
- Zero balance operations
- Maximum balance operations
- Decimal precision handling
- Invalid input rejection
- State persistence after failed operations
- Sequential transaction processing

---

## Test Execution Status Summary

| Category | Total Tests | Passed | Failed | Status |
|---|---|---|---|---|
| Balance Viewing | 4 | | | |
| Credit Operations | 4 | | | |
| Debit Operations (Valid) | 5 | | | |
| Debit Operations (Invalid) | 2 | | | |
| Menu & Input Validation | 4 | | | |
| Sequential Operations | 4 | | | |
| Precision & Boundary | 2 | | | |
| **TOTAL** | **25** | | | |

---

## Notes

- All test cases should be executed in order to ensure comprehensive coverage
- Failed tests should be documented with specific error messages and screenshots if possible
- Edge cases (TC-008, TC-023, TC-024) are critical for validating business rule enforcement
- State persistence tests (TC-010, TC-015, TC-025) ensure data integrity across operations
- Invalid input tests verify error handling and robustness

