import fs from "node:fs/promises";

const data = await fs.readFile("./22.in", "utf8");

const mod = (v, n) => (v < 0 ? (v % n) + n : v % n);

// Indexes map to deltas to move in the direction associated with the index:
//   0 -> right
//   1 -> down
//   2 -> left
//   3 -> up
const DELTAS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

const where = (map, x, y, dir) => {
  const positions = [];
  const [deltaX, deltaY] = DELTAS[dir];
  let amount = dir % 2 == 0 ? map[0].length : map.length;
  while (amount-- > 0) {
    if (map[y][x] == ".") {
      positions.push([x, y]);
    } else if (map[y][x] == "#") {
      return { positions, blocked: true };
    }

    x = mod(x + deltaX, map[0].length);
    y = mod(y + deltaY, map.length);
  }
  return { positions, blocked: false };
};

const processMap = (map) => {
  // newMap[y][x] = [positions reachable moving... right, down, left, up]
  const newMap = map.map((row) => row.map(() => undefined));

  for (let y = 0; y < map.length; ++y) {
    const row = map[y];
    for (let x = 0; x < row.length; ++x) {
      const v = row[x];
      switch (v) {
        case " ":
        case "#":
          break;
        case ".": {
          newMap[y][x] = [where(map, x, y, 0), where(map, x, y, 1), where(map, x, y, 2), where(map, x, y, 3)];
        }
      }
    }
  }
  return newMap;
};

/** @return {[any[][], string]} */
const read = (group) => {
  let [map, directions] = group.split("\n\n");
  return [processMap(map.split("\n").map((row) => row.split(""))), directions];
};

const regex = /(\d+)([RL])?/g;

const simulate = (map, directions) => {
  let direction = 0;
  let x = map[0].findIndex((v) => v != undefined);
  let y = 0;
  for (let [amount, turn] of directions) {
    console.log(x, y, direction);
    const cell = map[y][x];
    const { positions, blocked } = cell[direction];
    if (blocked) {
      amount = Math.min(amount, positions.length - 1);
    } else {
      amount = mod(amount, positions.length);
    }

    [x, y] = positions[amount];
    if (turn) direction = mod(direction + (turn == "R" ? 1 : -1), 4);
  }

  return direction + (x + 1) * 4 + (y + 1) * 1000;
};

// Part 1`
data
  .split("\n---\n")
  .map((group) => {
    const [map, directions] = read(group);
    const steps = Array.from(directions.matchAll(regex)).map((v) => [Number(v[1]), v[2]]);
    return simulate(map, steps);
  })
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n---\n")
  .map((group) => {
    //
  })
  .forEach((v) => console.log(v));
