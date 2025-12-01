import { chunk, concat, drop, dropRight, reverse, take } from "lodash-es";
import fs from "node:fs/promises";

const transpose = (arr) => arr[0].map((_, i) => arr.map((row) => row[i]));

const parseStackLine = (line) => chunk(line, 4).map((s) => s.join("").trim()[1] ?? "");
const parseStacks = (lines) =>
  transpose(dropRight(lines, 1).map((line) => parseStackLine(line))).map((stack) => stack.filter((v) => v != ""));

const apply9000 = (stacks, procedure) => {
  const [_, amount, from, to] = procedure.match(/move (\d+) from (\d+) to (\d+)/).map(Number);
  stacks[to - 1] = concat(reverse(take(stacks[from - 1], amount)), stacks[to - 1]);
  stacks[from - 1] = drop(stacks[from - 1], amount);
  return stacks;
};

const apply9001 = (stacks, procedure) => {
  const [_, amount, from, to] = procedure.match(/move (\d+) from (\d+) to (\d+)/).map(Number);
  stacks[to - 1] = concat(take(stacks[from - 1], amount), stacks[to - 1]);
  stacks[from - 1] = drop(stacks[from - 1], amount);
  return stacks;
};

const data = await fs.readFile("./5.in", "utf8");

// Part 1
console.log(
  data.split("---\n").map((group) => {
    const [stacksString, procedures] = group.split("\n\n");
    const stacks = parseStacks(stacksString.split("\n"));
    const result = procedures.trim().split("\n").reduce(apply9000, stacks);
    return result.map((stack) => stack[0]).join("");
  })
);

// Part 2
console.log(
  data.split("---\n").map((group) => {
    const [stacksString, procedures] = group.split("\n\n");
    const stacks = parseStacks(stacksString.split("\n"));
    const result = procedures.trim().split("\n").reduce(apply9001, stacks);
    return result.map((stack) => stack[0]).join("");
  })
);
