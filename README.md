# Calculator

A beginner-friendly calculator built with semantic HTML, responsive CSS, and
vanilla JavaScript.

## Features

- Addition, subtraction, multiplication, and division
- Decimal, percentage, sign, clear, and delete controls
- Keyboard input
- Three-item calculation history
- Responsive desktop and mobile layouts
- Persistent light and dark themes using `localStorage`

## Run locally

No build tools or dependencies are required. Clone the repository and open
`index.html` in a browser, or serve the folder with any local static server.

## Project structure

- `index.html` defines the calculator, keypad, accessible output, and history.
- `styles.css` contains design tokens, component styles, and responsive rules.
- `script.js` manages input, calculation state, arithmetic, errors, history,
  keyboard controls, and the saved theme preference.

## Keyboard controls

| Key | Action |
| --- | --- |
| `0`–`9` | Enter digits |
| `+`, `-`, `*`, `/` | Select an operator |
| `.` | Add a decimal point |
| `%` | Convert to a percentage |
| `Enter` or `=` | Calculate the result |
| `Backspace` | Delete the last digit |
| `Escape` | Clear the calculator |

## JavaScript flow

1. One delegated click listener reads each button's `data-action`.
2. Input functions update the value currently shown on the screen.
3. Operator selection stores the first number and waits for a second number.
4. Pressing equals calculates and formats the result.
5. Successful calculations are stored in a three-item history array.
6. The history panel is rebuilt from that array after every completed result.

## Class naming

The project uses a component-based naming pattern:

```text
component__part--variation
```

Examples include `calculator__key`, `calculator__key--equals`, and
`history-panel__content`.

## Theme persistence

The active theme is represented by `theme--light` on the root `<html>` element.
JavaScript saves the user's choice under `calculator-theme` in `localStorage`.
