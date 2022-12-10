import { chunk, inRange, range } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./10.in", "utf8");

const interpret = ([x, cycle], instruction) => {
  const [instr, arg] = instruction.split(" ");
  switch (instr) {
    case "noop":
      return [x, cycle + 1];
    case "addx":
      return [x + Number(arg), cycle + 2];
    default:
      throw `::${instruction}::`;
  }
};

// Part 1
console.log(
  data.split("\n---\n").map((group) => {
    const cyclesToConsider = [20, 60, 100, 140, 180, 220];
    const [_a, _b, signal] = group.split("\n").reduce(
      ([x, cycle, value], instruction) => {
        const [newX, newCycle] = interpret([x, cycle], instruction);
        if (newCycle >= cyclesToConsider[0]) {
          const cycleToConsider = cyclesToConsider.shift();
          return [newX, newCycle, value + x * cycleToConsider];
        } else {
          return [newX, newCycle, value];
        }
      },
      [1, 0, 0]
    );
    return signal;
  })
);

// Part 2
data
  .split("\n---\n")
  .map((group) => {
    const stride = 40;
    const [_a, _b, screen] = group.split("\n").reduce(
      ([x, cycle, screen], instruction) => {
        const [newX, newCycle] = interpret([x, cycle], instruction);
        // @ts-ignore
        range(newCycle - cycle).forEach((value) => {
          const column = (cycle + value) % stride;
          screen += inRange(column, x - 1, x + 2) ? "#" : ".";
        });
        return [newX, newCycle, screen];
      },
      [1, 0, ""]
    );
    return chunk(screen, stride)
      .map((v) => v.join(""))
      .join("\n");
  })
  .forEach((v) => console.log(v + "\n"));
