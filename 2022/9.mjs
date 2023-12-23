import { range } from "lodash-es";
import fs from "node:fs/promises";

const dirIncrements = {
  R: [1, 0],
  L: [-1, 0],
  U: [0, 1],
  D: [0, -1],
};

const move = (head, tail, direction) => {
  const [dx, dy] = dirIncrements[direction];
  head[0] += dx;
  head[1] += dy;
  update(head, tail[0]);
  range(1, tail.length).forEach((index) => {
    update(tail[index - 1], tail[index]);
  });
};

const update = (head, tail) => {
  const diffX = head[0] - tail[0];
  const diffY = head[1] - tail[1];
  const absDiffX = Math.abs(diffX);
  const absDiffY = Math.abs(diffY);
  if (absDiffX <= 1 && absDiffY <= 1) {
    // No need to move (•̀o•́)ง
  } else {
    tail[0] += Math.sign(diffX);
    tail[1] += Math.sign(diffY);
  }
};

const data = await fs.readFile("./9.in", "utf8");

// Part 1
console.log(
  data.split("---\n").map((group) => {
    const head = [0, 0];
    const tail = [[0, 0]];
    return group.split("\n").reduce((seen, instruction) => {
      const [dir, amount] = instruction.split(" ");
      range(Number(amount)).forEach(() => {
        move(head, tail, dir);
        seen.add(`${tail[0][0]},${tail[0][1]}`);
      });
      return seen;
    }, new Set()).size;
  })
);

// Part 2
console.log(
  data.split("---\n").map((group) => {
    const head = [0, 0];
    const tail = range(9).map(() => [0, 0]);
    return group.split("\n").reduce((seen, instruction) => {
      const [dir, amount] = instruction.split(" ");
      range(Number(amount)).forEach(() => {
        move(head, tail, dir);
        seen.add(`${tail[8][0]},${tail[8][1]}`);
      });
      return seen;
    }, new Set()).size;
  })
);
