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

const op = (a, b, op) => {
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

const evaluate = (monkeys, name) => {
  const m = monkeys[name];
  if (Array.isArray(m)) {
    monkeys[name] = op(evaluate(monkeys, m[0]), evaluate(monkeys, m[2]), m[1]);
  }
  return monkeys[name];
};

// Part 1`
data
  .split("\n---\n")
  .map((group) => evaluate(readMonkeys(group), "root"))
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n---\n")
  .map((group) => {
    //
  })
  .forEach((v) => console.log(v));
