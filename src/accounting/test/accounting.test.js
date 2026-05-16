"use strict";

const {
  EXIT_MESSAGE,
  INVALID_MENU_MESSAGE,
  dataProgram,
  getMenuAction,
  processOperation,
  resetStorageBalance,
} = require("../index");

function runScenario(steps) {
  const messages = [];

  for (const step of steps) {
    const action = getMenuAction(step.choice);

    if (action.message) {
      messages.push(action.message);
      continue;
    }

    if (action.operationType === "TOTAL") {
      messages.push(processOperation("TOTAL"));
      continue;
    }

    if (action.operationType === "CREDIT") {
      messages.push(processOperation("CREDIT", step.amount));
      continue;
    }

    if (action.operationType === "DEBIT") {
      messages.push(processOperation("DEBIT", step.amount));
      continue;
    }

    if (action.continueFlag === "NO") {
      messages.push(EXIT_MESSAGE);
      break;
    }
  }

  return messages;
}

describe("COBOL test plan parity", () => {
  beforeEach(() => {
    resetStorageBalance();
  });

  test("TC-001: View initial account balance", () => {
    expect(processOperation("TOTAL")).toBe("Current balance: 1000.00");
  });

  test("TC-002: Credit valid amount", () => {
    expect(processOperation("CREDIT", "500")).toBe("Amount credited. New balance: 1500.00");
  });

  test("TC-003: Credit small amount", () => {
    expect(processOperation("CREDIT", "1")).toBe("Amount credited. New balance: 1001.00");
  });

  test("TC-004: Credit large amount", () => {
    expect(processOperation("CREDIT", "999000")).toBe(
      "Transaction rejected. Balance cannot exceed 999999.99."
    );
  });

  test("TC-005: Credit with decimal precision", () => {
    expect(processOperation("CREDIT", "250.50")).toBe("Amount credited. New balance: 1250.50");
  });

  test("TC-006: Debit valid amount (sufficient funds)", () => {
    expect(processOperation("DEBIT", "300")).toBe("Amount debited. New balance: 700.00");
  });

  test("TC-007: Debit small amount", () => {
    expect(processOperation("DEBIT", "1")).toBe("Amount debited. New balance: 999.00");
  });

  test("TC-008: Debit exact balance amount", () => {
    expect(processOperation("DEBIT", "1000")).toBe("Amount debited. New balance: 0.00");
  });

  test("TC-009: Debit exceeding balance (insufficient funds)", () => {
    processOperation("DEBIT", "500");
    expect(processOperation("DEBIT", "600")).toBe("Insufficient funds for this debit.");
    expect(processOperation("TOTAL")).toBe("Current balance: 500.00");
  });

  test("TC-010: Debit with insufficient funds - retry", () => {
    processOperation("DEBIT", "500");
    expect(processOperation("DEBIT", "600")).toBe("Insufficient funds for this debit.");
    expect(processOperation("DEBIT", "300")).toBe("Amount debited. New balance: 200.00");
    expect(processOperation("TOTAL")).toBe("Current balance: 200.00");
  });

  test("TC-011: Invalid menu choice - letter input", () => {
    expect(getMenuAction("A").message).toBe(INVALID_MENU_MESSAGE);
  });

  test("TC-012: Invalid menu choice - out of range", () => {
    expect(getMenuAction("5").message).toBe(INVALID_MENU_MESSAGE);
  });

  test("TC-013: Invalid menu choice - zero", () => {
    expect(getMenuAction("0").message).toBe(INVALID_MENU_MESSAGE);
  });

  test("TC-014: Exit program normally", () => {
    const messages = runScenario([{ choice: "4" }]);
    expect(messages).toContain(EXIT_MESSAGE);
  });

  test("TC-015: Sequential operations - credit then debit", () => {
    processOperation("CREDIT", "500");
    expect(processOperation("TOTAL")).toBe("Current balance: 1500.00");
    processOperation("DEBIT", "200");
    expect(processOperation("TOTAL")).toBe("Current balance: 1300.00");
  });

  test("TC-016: Multiple credits in sequence", () => {
    expect(processOperation("CREDIT", "100")).toBe("Amount credited. New balance: 1100.00");
    expect(processOperation("CREDIT", "200")).toBe("Amount credited. New balance: 1300.00");
    expect(processOperation("CREDIT", "150")).toBe("Amount credited. New balance: 1450.00");
    expect(processOperation("TOTAL")).toBe("Current balance: 1450.00");
  });

  test("TC-017: Multiple debits in sequence", () => {
    expect(processOperation("DEBIT", "100")).toBe("Amount debited. New balance: 900.00");
    expect(processOperation("DEBIT", "200")).toBe("Amount debited. New balance: 700.00");
    expect(processOperation("DEBIT", "150")).toBe("Amount debited. New balance: 550.00");
    expect(processOperation("TOTAL")).toBe("Current balance: 550.00");
  });

  test("TC-018: Mixed operations - credit, debit, credit, debit", () => {
    processOperation("CREDIT", "300");
    processOperation("DEBIT", "400");
    processOperation("CREDIT", "200");
    processOperation("DEBIT", "150");
    expect(processOperation("TOTAL")).toBe("Current balance: 950.00");
  });

  test("TC-019: View balance multiple times", () => {
    expect(processOperation("TOTAL")).toBe("Current balance: 1000.00");
    expect(processOperation("TOTAL")).toBe("Current balance: 1000.00");
    expect(processOperation("TOTAL")).toBe("Current balance: 1000.00");
    expect(processOperation("TOTAL")).toBe("Current balance: 1000.00");
  });

  test("TC-020: Menu loop returns correctly after operation", () => {
    const messages = runScenario([
      { choice: "1" },
      { choice: "1" },
      { choice: "4" },
    ]);

    const balanceMessages = messages.filter((message) => message === "Current balance: 1000.00");
    expect(balanceMessages.length).toBe(2);
    expect(messages[messages.length - 1]).toBe(EXIT_MESSAGE);
  });

  test("TC-021: Balance precision after calculation", () => {
    expect(processOperation("CREDIT", "0.50")).toBe("Amount credited. New balance: 1000.50");
    expect(processOperation("CREDIT", "0.25")).toBe("Amount credited. New balance: 1000.75");
    expect(processOperation("TOTAL")).toBe("Current balance: 1000.75");
  });

  test("TC-022: Debit attempt with exact remaining balance", () => {
    processOperation("DEBIT", "500");
    expect(processOperation("DEBIT", "500.00")).toBe("Amount debited. New balance: 0.00");
    expect(processOperation("TOTAL")).toBe("Current balance: 0.00");
  });

  test("TC-023: Debit attempt with 1 cent over balance", () => {
    processOperation("DEBIT", "900");
    expect(processOperation("DEBIT", "100.01")).toBe("Insufficient funds for this debit.");
    expect(processOperation("TOTAL")).toBe("Current balance: 100.00");
  });

  test("TC-024: Large balance accumulated", () => {
    expect(processOperation("CREDIT", "999000")).toBe(
      "Transaction rejected. Balance cannot exceed 999999.99."
    );
    expect(processOperation("TOTAL")).toBe("Current balance: 1000.00");
  });

  test("TC-025: Session persistence - multiple transactions", () => {
    processOperation("CREDIT", "100");
    processOperation("DEBIT", "50");
    expect(processOperation("TOTAL")).toBe("Current balance: 1050.00");
    processOperation("CREDIT", "75");
    expect(processOperation("TOTAL")).toBe("Current balance: 1125.00");
  });

  test("Data layer integrity: write then read keeps cents", () => {
    dataProgram("WRITE", 1234.56);
    expect(dataProgram("READ")).toBe(1234.56);
  });
});
