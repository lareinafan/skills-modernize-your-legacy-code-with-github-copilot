"use strict";

const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const DEFAULT_BALANCE = 1000.0;
const MAX_BALANCE = 999999.99;
let storageBalance = DEFAULT_BALANCE;

const EXIT_MESSAGE = "Exiting the program. Goodbye!";
const INVALID_MENU_MESSAGE = "Invalid choice, please select 1-4.";

function formatMoney(value) {
  return value.toFixed(2);
}

function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

function resetStorageBalance(value = DEFAULT_BALANCE) {
  storageBalance = roundToCents(value);
}

// Mirrors data.cob: READ returns stored balance, WRITE updates stored balance.
function dataProgram(operationType, balance) {
  if (operationType === "READ") {
    return storageBalance;
  }

  if (operationType === "WRITE") {
    storageBalance = balance;
    return storageBalance;
  }

  throw new Error(`Unsupported data operation: ${operationType}`);
}

function parseAmount(rawValue) {
  const amount = Number.parseFloat(String(rawValue).trim());

  if (!Number.isFinite(amount)) {
    return { ok: false, message: "Invalid amount. Please enter a numeric value." };
  }

  if (amount < 0) {
    return { ok: false, message: "Amount cannot be negative." };
  }

  if (amount > MAX_BALANCE) {
    return {
      ok: false,
      message: `Amount exceeds maximum allowed value (${formatMoney(MAX_BALANCE)}).`,
    };
  }

  return { ok: true, value: roundToCents(amount) };
}

function processOperation(operationType, rawAmount) {
  if (operationType === "TOTAL") {
    const finalBalance = dataProgram("READ");
    return `Current balance: ${formatMoney(finalBalance)}`;
  }

  if (operationType === "CREDIT") {
    const amountResult = parseAmount(rawAmount);

    if (!amountResult.ok) {
      return amountResult.message;
    }

    let finalBalance = dataProgram("READ");
    finalBalance = roundToCents(finalBalance + amountResult.value);

    if (finalBalance > MAX_BALANCE) {
      return `Transaction rejected. Balance cannot exceed ${formatMoney(MAX_BALANCE)}.`;
    }

    dataProgram("WRITE", finalBalance);
    return `Amount credited. New balance: ${formatMoney(finalBalance)}`;
  }

  if (operationType === "DEBIT") {
    const amountResult = parseAmount(rawAmount);

    if (!amountResult.ok) {
      return amountResult.message;
    }

    let finalBalance = dataProgram("READ");

    if (finalBalance >= amountResult.value) {
      finalBalance = roundToCents(finalBalance - amountResult.value);
      dataProgram("WRITE", finalBalance);
      return `Amount debited. New balance: ${formatMoney(finalBalance)}`;
    }

    return "Insufficient funds for this debit.";
  }

  return `Unsupported operation: ${operationType}`;
}

function getMenuAction(userChoice) {
  const parsedChoice = Number.parseInt(String(userChoice).trim(), 10);

  switch (parsedChoice) {
    case 1:
      return { continueFlag: "YES", operationType: "TOTAL" };
    case 2:
      return { continueFlag: "YES", operationType: "CREDIT" };
    case 3:
      return { continueFlag: "YES", operationType: "DEBIT" };
    case 4:
      return { continueFlag: "NO" };
    default:
      return { continueFlag: "YES", message: INVALID_MENU_MESSAGE };
  }
}

// Mirrors operations.cob: TOTAL/CREDIT/DEBIT with read-before-calc and write-after-update.
async function operations(operationType, rl) {
  if (operationType === "CREDIT" || operationType === "DEBIT") {
    const prompt = operationType === "CREDIT" ? "Enter credit amount: " : "Enter debit amount: ";
    const rawAmount = await rl.question(prompt);
    const message = processOperation(operationType, rawAmount);
    output.write(`${message}\n`);
    return;
  }

  output.write(`${processOperation(operationType)}\n`);
}

async function main() {
  const rl = readline.createInterface({ input, output });
  let continueFlag = "YES";

  try {
    while (continueFlag !== "NO") {
      output.write("--------------------------------\n");
      output.write("Account Management System\n");
      output.write("1. View Balance\n");
      output.write("2. Credit Account\n");
      output.write("3. Debit Account\n");
      output.write("4. Exit\n");
      output.write("--------------------------------\n");

      const userChoice = await rl.question("Enter your choice (1-4): ");
      const action = getMenuAction(userChoice);

      if (action.operationType) {
        if (action.operationType === "CREDIT") {
          const rawAmount = await rl.question("Enter credit amount: ");
          output.write(`${processOperation("CREDIT", rawAmount)}\n`);
        } else if (action.operationType === "DEBIT") {
          const rawAmount = await rl.question("Enter debit amount: ");
          output.write(`${processOperation("DEBIT", rawAmount)}\n`);
        } else {
          output.write(`${processOperation("TOTAL")}\n`);
        }
      } else if (action.message) {
        output.write(`${action.message}\n`);
      } else {
        continueFlag = action.continueFlag;
      }
    }

    output.write(`${EXIT_MESSAGE}\n`);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Unexpected error:", error);
    process.exitCode = 1;
  });
}

module.exports = {
  DEFAULT_BALANCE,
  MAX_BALANCE,
  EXIT_MESSAGE,
  INVALID_MENU_MESSAGE,
  formatMoney,
  roundToCents,
  resetStorageBalance,
  dataProgram,
  parseAmount,
  processOperation,
  getMenuAction,
  main,
};