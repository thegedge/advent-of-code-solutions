import { range } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./17.in", "utf8");

// My first attempt represented it as multidimensional arrays of booleans. I realized this could be
// much faster by doing boolean operations on numbers. If A & B != 0, they intersect.
const shapes = [
  [4, [0b1111000]],
  [3, [0b0100000, 0b1110000, 0b0100000]],
  [3, [0b0010000, 0b0010000, 0b1110000]],
  [1, [0b1000000, 0b1000000, 0b1000000, 0b1000000]],
  [2, [0b1100000, 0b1100000]],
];

const MAP_WIDTH = 7;
const MAP_RANGE = range(MAP_WIDTH);

const isBitSet = (v, n) => (v & (1 << (7 - n))) != 0;

const dump = (map, shape, x, y) => {
  const maps = [
    ...range(y < 0 ? -y : 0).map(() => ".".repeat(7)),
    ...map.map((bitmask) => {
      return MAP_RANGE.map((v) => (isBitSet(bitmask, v) ? "#" : ".")).join("");
    }),
  ];

  if (shape) {
    const sy = y < 0 ? 0 : y;
    shape.forEach((bitmask, row) => {
      MAP_RANGE.forEach((v, col) => {
        if (isBitSet(bitmask, v >> x)) {
          const s = maps[sy + row];
          maps[sy + row] = s.substring(0, x + col) + "@" + s.substring(x + col + 1);
        }
      });
    });
  }

  console.log(maps.join("\n") + "\n");
};

const simulate = (group, N) => {
  const deltas = group.split("").map((v) => (v == "<" ? -1 : 1));
  const map = [];

  // TODO lookup table for intersection tests
  const intersectShape = (shape, x, y) => {
    if (x < 0 || x + shape[0] > MAP_WIDTH) {
      return true;
    }

    // Small optimization: go in reverse, because we're likely to intersect on the bottom
    for (let row = shape[1].length - 1, index = y + row; row >= 0; --row, --index) {
      if (index < 0) {
        return false;
      }

      if (index < map.length && ((shape[1][row] >> x) & map[index]) != 0) {
        return true;
      }
    }

    return false;
  };

  let height = 0;
  let deltaIndex = 0;
  const start = performance.now();
  const iters = Math.min(N, 1_000_000);
  for (let rock = 0; rock < iters; ++rock) {
    const shape = shapes[rock % shapes.length];
    const shapeHeight = shape[1].length;

    let x = 2;
    let y = -3 - shapeHeight;

    while (true) {
      if (!intersectShape(shape, x + deltas[deltaIndex], y)) {
        x += deltas[deltaIndex];
      }

      // Important this is here, before we potentially break below
      deltaIndex = (deltaIndex + 1) % deltas.length;

      if (y + shapeHeight == height) {
        break;
      }

      // If we're still in the empty space where we started, don't do the intersection
      if (y + shapeHeight >= 0 && intersectShape(shape, x, y + 1)) {
        break;
      }

      ++y;
    }

    if (map.length > 1000) {
      map.splice(200);
    }

    while (y < 0) {
      map.unshift(0);
      ++height;
      ++y;
    }

    shape[1][0] && (map[y + 0] |= shape[1][0] >> x);
    shape[1][1] && (map[y + 1] |= shape[1][1] >> x);
    shape[1][2] && (map[y + 2] |= shape[1][2] >> x);
    shape[1][3] && (map[y + 3] |= shape[1][3] >> x);
  }

  const usPerIter = (1000 * (performance.now() - start)) / iters;
  console.log(usPerIter.toFixed(3));

  return height;
};

// Part 1

data
  .split("\n")
  .map((group) => {
    return simulate(group, 2022);
  })
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n")
  .map((group) => {
    return simulate(group, 1_000_000_000_000);
  })
  .forEach((v) => console.log(v));
