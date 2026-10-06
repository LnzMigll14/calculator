# Calculator

A beginner-friendly calculator built with semantic HTML, responsive CSS, and
vanilla JavaScript.

## Project structure

- `index.html` defines the calculator, keypad, accessible output, and history.
- `styles.css` contains design tokens, component styles, and responsive rules.
- `script.js` manages input, calculation state, arithmetic, errors, and history.

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
