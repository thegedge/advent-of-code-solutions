import { range } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./17.in", "utf8");

// My first attempt represented it as multidimensional arrays of booleans. I realized this could be
// much faster by doing boolean operations on numbers. If A & B != 0, they intersect.
const shapes = [
  [4, [0b11110000]],
  [3, [0b01000000, 0b11100000, 0b01000000]],
  [3, [0b00100000, 0b00100000, 0b11100000]],
  [1, [0b10000000, 0b10000000, 0b10000000, 0b10000000]],
  [2, [0b11000000, 0b11000000]],
];

const MAP_WIDTH = 7;
const MAP_RANGE = range(MAP_WIDTH);

const isBitSet = (v, n) => (v & (1 << (7 - n))) != 0;

class Map {
  constructor(max = 5000) {
    this.y = 0;
    this.lo = 0;
    this.hi = 0;
    this.data = new Uint8ClampedArray(max);
    this.data.fill(0xff);
  }

  unshift() {
    this.lo = (this.lo - 1 + this.length) % this.length;
    this.data[this.lo] = 0;

    if (this.lo == this.hi) {
      this.hi = (this.hi - 1 + this.length) % this.length;
    }
  }

  get length() {
    return this.data.length;
  }

  test(shape, x, y) {
    if (x < 0 || x + shape[0] > MAP_WIDTH) {
      return true;
    }

    // Small optimization: go in reverse, because we're likely to intersect on the bottom
    for (let row = shape[1].length - 1; row >= 0; --row) {
      if (y + row < 0) {
        return false;
      }

      if (((shape[1][row] >> x) & this.get(y + row)) != 0) {
        return true;
      }
    }

    return false;
  }

  get(row) {
    return this.data[(this.lo + row) % this.length];
  }

  set(shape, x, y) {
    let row = 0;

    y++ >= 0 && this.union(row++, shape[1][0] >> x);
    if (shape[1][1]) {
      y++ >= 0 && this.union(row++, shape[1][1] >> x);
      if (shape[1][2]) {
        y++ >= 0 && this.union(row++, shape[1][2] >> x);
        if (shape[1][3]) {
          y++ >= 0 && this.union(row++, shape[1][3] >> x);
        }
      }
    }
  }

  union(row, value) {
    this.data[(this.lo + row) % this.data.length] |= value;
  }

  dump(shape, x, y) {
    const maps = range(y < 0 ? -y : 0).map(() => ".".repeat(7));

    let index = this.lo;
    while (index != this.hi) {
      const bitmask = this.data[index];
      maps.push(MAP_RANGE.map((v) => (isBitSet(bitmask, v) ? "#" : ".")).join(""));
      index = (index + 1) % this.data.length;
    }

    if (shape) {
      const sy = y < 0 ? 0 : y;
      shape[1].forEach((bitmask, row) => {
        MAP_RANGE.forEach((v, col) => {
          if (isBitSet(bitmask >> x, v)) {
            const s = maps[sy + row];
            maps[sy + row] = s.substring(0, col) + "@" + s.substring(col + 1);
          }
        });
      });
    }

    console.log(maps.join("\n") + "\n");
  }
}

const simulate = (group, N) => {
  const deltas = group.split("").map((v) => (v == "<" ? -1 : 1));
  const map = new Map();

  let height = 0;
  let deltaIndex = 0;
  const start = performance.now();
  const iters = Math.min(N, 10_000_000);
  for (let rock = 0; rock < iters; ++rock) {
    const shape = shapes[rock % shapes.length];
    const shapeHeight = shape[1].length;

    let x = 2;
    let y = -3 - shapeHeight;

    while (true) {
      // map.dump(shape, x, y);

      if (!map.test(shape, x + deltas[deltaIndex], y)) {
        x += deltas[deltaIndex];
      }

      // Important this is here, before we potentially break below
      deltaIndex = (deltaIndex + 1) % deltas.length;

      if (y + shapeHeight == height) {
        // console.log("grounded");
        break;
      }

      // If we're still in the empty space where we started, don't do the intersection
      if (y + shapeHeight >= 0 && map.test(shape, x, y + 1)) {
        // console.log("intersected");
        break;
      }

      ++y;
    }

    while (y < 0) {
      map.unshift();
      ++height;
      ++y;
    }

    map.set(shape, x, y);
  }

  const usPerIter = (1000 * (performance.now() - start)) / iters;
  console.log(usPerIter.toFixed(3));

  return height;
};

// Part 1
data
  .split("\n")
  .map((group, index) => {
    if (index == 1) {
      return 0;
    }
    return simulate(group, 2022);
  })
  .forEach((v) => console.log(v));

// Part 2
// data
//   .split("\n")
//   .map((group, index) => {
//     if (index == 1) return 0;
//     return simulate(group, 1_000_000_000_000);
//   })
//   .forEach((v) => console.log(v));
