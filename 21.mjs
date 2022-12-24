import { identity } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./21.in", "utf8");

const readMonkeys = (group) => {
  return Object.fromEntries(
    group.split("\n").map((v) => {
      const [name, op] = v.split(": ");
      const num = Number(op);
      return [name, Number.isNaN(num) ? op.split(" ") : num];
    })
  );
};

const doOp = (a, b, op) => {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return a / b;
  }
};

const inverse = (op) => {
  switch (op) {
    case "+":
      return "-";
    case "-":
      return "+";
    case "*":
      return "/";
    case "/":
      return "*";
  }
};

// Just evaluate everything as-is, no tricks here
const evaluate = (monkeys, name) => {
  const m = monkeys[name];
  if (Array.isArray(m)) {
    // We could cache this if performance was a problem, but it isn't on this problem
    return doOp(evaluate(monkeys, m[0]), evaluate(monkeys, m[2]), m[1]);
  }
  return m;
};

// Track the path until we hit the variable with a given name, and assume it's a constant. Once we get to that variable
// we have to do the inverse of all of the operations that got us to that variable to solve for it. An easy way for us
// to track this is using the closure provided by a JS arrow function, instead of having to maintain a stack :D
const solve = (monkeys, name, varToSolveFor) => {
  if (name == varToSolveFor) {
    return identity;
  }

  let result = monkeys[name];
  if (Array.isArray(result)) {
    const [a, op, b] = result;
    const resultA = solve(monkeys, a, varToSolveFor);
    const resultB = solve(monkeys, b, varToSolveFor);

    if (typeof resultA == "function") {
      result = name == "root" ? resultA(resultB) : (v) => resultA(doOp(v, resultB, inverse(op)));
    } else if (typeof resultB == "function") {
      if (name == "root") {
        return resultB(resultA);
      }

      // Subtraction and division are a little more complicated when the variable is on the right, so we handle that specially
      if (op == "-") {
        // v = resultA - expression => expression = resultA - v
        result = (v) => resultB(resultA - v);
      } else if (op == "/") {
        // v = resultA / expression => expression = resultA / v
        result = (v) => resultB(resultA / v);
      } else {
        result = (v) => resultB(doOp(v, resultA, inverse(op)));
      }
    } else {
      result = doOp(resultA, resultB, op);
    }
  }

  return result;
};

// Part 1
data
  .split("\n---\n")
  .map((group) => evaluate(readMonkeys(group), "root"))
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n---\n")
  .map((group) => {
    console.log();
    return solve(readMonkeys(group), "root", "humn");
  })
  .forEach((v) => console.log(v));
