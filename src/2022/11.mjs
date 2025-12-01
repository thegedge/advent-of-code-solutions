import { identity, multiply, range, take } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./11.in", "utf8");

const readMonkeys = (scenario, wrap) => {
  const groups = scenario.split("\n\n");
  return groups.map((group) => {
    const lines = group.split("\n");
    const items = lines[1].substring("  Starting items: ".length).split(", ").map(Number);
    const op = lines[2].substring("  Operation: new = ".length);
    const divisible = Number(lines[3].substring("  Test: divisible by ".length));
    const truthy = Number(lines[4].substring("    If true: throw to monkey ".length));
    const falsey = Number(lines[5].substring("    If false: throw to monkey ".length));
    return {
      items,
      divisible,
      operation: wrap(new Function("old", `return ${op};`)),
      pass: (value) => (value % divisible == 0 ? truthy : falsey),
      inspected: 0,
    };
  });
};

const simulate = (monkeys, numRounds) => {
  const commonMultiple = monkeys.map((m) => m.divisible).reduce(multiply);
  range(numRounds).forEach(() => {
    for (const monkey of monkeys) {
      range(monkey.items.length).forEach(() => {
        monkey.inspected++;
        const item = monkey.items.shift();
        const newValue = monkey.operation(item) % commonMultiple; // keep the value from growing super large
        monkeys[monkey.pass(newValue)].items.push(newValue);
      });
    }
  });
};

const monkeyBusiness = (monkeys) => {
  return take(
    monkeys.map((m) => m.inspected).sort((a, b) => b - a),
    2
  ).reduce(multiply);
};

// Part 1
console.log(
  data.split("\n---\n").map((scenario) => {
    const monkeys = readMonkeys(scenario, (f) => (old) => Math.floor(f(old) / 3));
    simulate(monkeys, 20);
    return monkeyBusiness(monkeys);
  })
);

// Part 2
console.log(
  data.split("\n---\n").map((scenario) => {
    const monkeys = readMonkeys(scenario, identity);
    simulate(monkeys, 10_000);
    return monkeyBusiness(monkeys);
  })
);
