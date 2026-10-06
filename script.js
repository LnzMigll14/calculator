/* -------------------------------------------------------------------------- */
/* DOM references                                                             */
/* Store frequently used elements once instead of searching the document      */
/* every time the calculator needs to update the interface.                   */
/* -------------------------------------------------------------------------- */

const calculator = document.querySelector(".calculator");
const output = document.querySelector("#calculator-output");
const statusMessage = document.querySelector("#calculator-status");
const historyContainer = document.querySelector(".history-panel__content");

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* Named constants make important limits and messages easy to find and edit.  */
/* -------------------------------------------------------------------------- */

const MAX_HISTORY_ITEMS = 3;
const ERROR_DISPLAY = "Error";

/* -------------------------------------------------------------------------- */
/* Calculator state                                                           */
/* These variables remember a calculation while the user enters it.           */
/* currentInput stays a string so pressing 1 and then 2 can produce "12".      */
/* -------------------------------------------------------------------------- */

let currentInput = "0";
let firstNumber = null;
let selectedOperator = null;
let waitingForSecondNumber = false;

/* History has separate state because clearing the calculator should not erase */
/* completed calculations from the history panel.                             */
const recentCalculations = [];

/* -------------------------------------------------------------------------- */
/* Event handling                                                             */
/* Event delegation lets one listener handle every calculator button.         */
/* data-action says what the button does; data-value contains its input value. */
/* -------------------------------------------------------------------------- */

calculator.addEventListener("click", handleCalculatorClick);

function handleCalculatorClick(event) {
  const button = event.target.closest("button[data-action]");

  // Ignore clicks that did not come from a calculator action button.
  if (!button) return;

  const { action, value } = button.dataset;

  switch (action) {
    case "digit":
      enterDigit(value);
      break;

    case "clear":
      clearCalculator();
      break;

    case "delete":
      deleteLastDigit();
      break;

    case "decimal":
      enterDecimal();
      break;

    case "sign":
      toggleSign();
      break;

    case "percent":
      convertToPercent();
      break;

    case "operator":
      chooseOperator(value);
      break;

    case "equals":
      showResult();
      break;
  }
}

/* -------------------------------------------------------------------------- */
/* Display and input functions                                                */
/* These functions change the value currently shown on the calculator screen. */
/* -------------------------------------------------------------------------- */

function updateDisplay() {
  output.textContent = currentInput;
}

function enterDigit(digit) {
  /*
   * The first digit after an operator starts a new number. It replaces the
   * previous display instead of being appended to the first number.
   */
  if (waitingForSecondNumber || currentInput === ERROR_DISPLAY) {
    currentInput = digit;
    waitingForSecondNumber = false;
  } else if (currentInput === "0") {
    currentInput = digit;
  } else {
    currentInput += digit;
  }

  updateDisplay();
}

function clearCalculator() {
  // Reset only the active calculation; completed history remains available.
  currentInput = "0";
  firstNumber = null;
  selectedOperator = null;
  waitingForSecondNumber = false;

  statusMessage.textContent = "Ready";
  updateDisplay();
}

function deleteLastDigit() {
  /*
   * Deleting "-5" must return to "0", not leave an invalid minus sign.
   * Delete is disabled while waiting because the displayed value still belongs
   * to the first number at that point.
   */
  if (waitingForSecondNumber) return;

  const isSingleNegativeDigit =
    currentInput.startsWith("-") && currentInput.length === 2;

  if (
    currentInput === ERROR_DISPLAY ||
    currentInput.length === 1 ||
    isSingleNegativeDigit
  ) {
    currentInput = "0";
  } else {
    currentInput = currentInput.slice(0, -1);
  }

  updateDisplay();
}

function enterDecimal() {
  // A new decimal number begins as "0." and each number gets one decimal only.
  if (waitingForSecondNumber || currentInput === ERROR_DISPLAY) {
    currentInput = "0.";
    waitingForSecondNumber = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }

  updateDisplay();
}

function toggleSign() {
  if (currentInput === ERROR_DISPLAY) return;

  currentInput = String(Number(currentInput) * -1);
  updateDisplay();
}

function convertToPercent() {
  if (currentInput === ERROR_DISPLAY || waitingForSecondNumber) return;

  currentInput = String(Number(currentInput) / 100);
  updateDisplay();
}

/* -------------------------------------------------------------------------- */
/* Calculation functions                                                      */
/* These functions manage operators, evaluate expressions, and reset state.   */
/* -------------------------------------------------------------------------- */

function chooseOperator(operator) {
  if (currentInput === ERROR_DISPLAY) return;

  const inputValue = Number(currentInput);

  /*
   * If an operator is pressed twice, replace the earlier operator instead of
   * starting an incomplete calculation.
   */
  if (selectedOperator !== null && waitingForSecondNumber) {
    selectedOperator = operator;
    statusMessage.textContent =
      currentInput + " " + getOperatorSymbol(operator);
    return;
  }

  if (firstNumber === null) {
    firstNumber = inputValue;
  } else if (selectedOperator !== null) {
    // Evaluate the previous operation so expressions can be chained.
    const result = calculate(firstNumber, inputValue, selectedOperator);

    if (result === ERROR_DISPLAY) {
      showCalculationError();
      return;
    }

    currentInput = formatResult(result);
    firstNumber = Number(currentInput);
    updateDisplay();
  }

  selectedOperator = operator;
  waitingForSecondNumber = true;
  statusMessage.textContent =
    currentInput + " " + getOperatorSymbol(operator);
}

function showResult() {
  // Equals needs two numbers and an operator before it can calculate anything.
  if (
    firstNumber === null ||
    selectedOperator === null ||
    waitingForSecondNumber
  ) {
    return;
  }

  const secondNumber = Number(currentInput);
  const operator = selectedOperator;
  const result = calculate(firstNumber, secondNumber, operator);

  if (result === ERROR_DISPLAY) {
    showCalculationError();
    return;
  }

  const formattedResult = formatResult(result);

  /*
   * Save the calculation before resetting firstNumber and selectedOperator,
   * because history needs those original values.
   */
  addCalculationToHistory(
    firstNumber,
    operator,
    secondNumber,
    formattedResult,
  );

  statusMessage.textContent =
    firstNumber +
    " " +
    getOperatorSymbol(operator) +
    " " +
    secondNumber +
    " =";

  currentInput = formattedResult;
  firstNumber = null;
  selectedOperator = null;
  waitingForSecondNumber = false;

  updateDisplay();
}

function calculate(first, second, operator) {
  // Keep arithmetic in one function so UI code does not perform calculations.
  switch (operator) {
    case "+":
      return first + second;

    case "-":
      return first - second;

    case "*":
      return first * second;

    case "/":
      return second === 0 ? ERROR_DISPLAY : first / second;

    default:
      return second;
  }
}

/* -------------------------------------------------------------------------- */
/* Calculation helpers                                                        */
/* Small helpers keep formatting and error behavior out of the main workflow. */
/* -------------------------------------------------------------------------- */

function formatResult(number) {
  /*
   * JavaScript floating-point math can produce values such as
   * 0.30000000000000004. Limiting precision gives a cleaner display.
   */
  return String(Number(number.toFixed(10)));
}

function getOperatorSymbol(operator) {
  const symbols = {
    "/": "\u00f7",
    "*": "\u00d7",
    "-": "\u2212",
    "+": "+",
  };

  return symbols[operator] ?? operator;
}

function showCalculationError() {
  currentInput = ERROR_DISPLAY;
  firstNumber = null;
  selectedOperator = null;
  waitingForSecondNumber = false;

  statusMessage.textContent = "Cannot divide by zero";
  updateDisplay();
}

/* -------------------------------------------------------------------------- */
/* Calculation history                                                        */
/* History storage and history rendering are kept separate from calculation.  */
/* -------------------------------------------------------------------------- */

function addCalculationToHistory(first, operator, second, result) {
  const calculation = {
    firstNumber: first,
    operator,
    secondNumber: second,
    result,
  };

  // Add newest entries first, then remove the oldest entry when over the limit.
  recentCalculations.unshift(calculation);

  if (recentCalculations.length > MAX_HISTORY_ITEMS) {
    recentCalculations.pop();
  }

  renderCalculationHistory();
}

function renderCalculationHistory() {
  // Rebuild the small list so it always matches the history array.
  historyContainer.replaceChildren();

  if (recentCalculations.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "history-panel__empty-message";
    emptyMessage.textContent = "No calculations yet.";

    historyContainer.append(emptyMessage);
    return;
  }

  recentCalculations.forEach((calculation) => {
    const historyItem = document.createElement("p");

    historyItem.className = "history-panel__item";
    historyItem.textContent =
      calculation.firstNumber +
      " " +
      getOperatorSymbol(calculation.operator) +
      " " +
      calculation.secondNumber +
      " = " +
      calculation.result;

    historyContainer.append(historyItem);
  });
}
