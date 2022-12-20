import { range } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./17.in", "utf8");

// My first attempt represented it as multidimensional arrays of booleans. I realized this could be
// much faster by doing boolean operations on numbers. If A & B != 0, they intersect.
/** @type {[number, number, number[]][]} */
const shapes = [
  [4, 1, [0b11110000, 0b00000000, 0b00000000, 0b00000000]],
  [3, 3, [0b01000000, 0b11100000, 0b01000000, 0b00000000]],
  [3, 3, [0b00100000, 0b00100000, 0b11100000, 0b00000000]],
  [1, 4, [0b10000000, 0b10000000, 0b10000000, 0b10000000]],
  [2, 2, [0b11000000, 0b11000000, 0b00000000, 0b00000000]],
];

const MAP_WIDTH = 7;
const MAP_RANGE = range(MAP_WIDTH);

const isBitSet = (v, n) => (v & (1 << (7 - n))) != 0;
const shapeInBounds = (shape, x) => x >= 0 && x + shape[0] <= MAP_WIDTH;

class Map {
  constructor(max = 500) {
    this.lo = 0;
    this.length = max;
    this.data = new Array(max);
    this.data.fill(0xff);
  }

  unshift(value) {
    this.lo = (this.lo - 1 + this.length) % this.length;
    this.data[this.lo] = value;
  }

  test(shape, x, y) {
    // Small optimization: go in reverse, because we're likely to intersect on the bottom
    for (let row = shape[1] - 1; row >= 0; --row) {
      if (y + row < 0) {
        return false;
      }

      if (((shape[2][row] >> x) & this.get(y + row)) != 0) {
        return true;
      }
    }

    return false;
  }

  get(row) {
    const index = this.lo + row;
    return this.data[index >= this.data.length ? index - this.length : index];
  }

  set(shape, x, y) {
    this.union(y + 0, shape[2][0] >> x);
    this.union(y + 1, shape[2][1] >> x);
    this.union(y + 2, shape[2][2] >> x);
    this.union(y + 3, shape[2][3] >> x);
  }

  union(row, value) {
    this.data[(this.lo + row) % this.data.length] |= value;
  }

  dump(shape, x, y) {
    const maps = range(y < 0 ? -y : 0).map(() => ".".repeat(7));

    let index = this.lo;
    for (let iter = 0; iter < this.length; ++iter) {
      const bitmask = this.data[index];
      maps.push(MAP_RANGE.map((v) => (isBitSet(bitmask, v) ? "#" : ".")).join(""));
      index = (index + 1) % this.data.length;
    }

    if (shape) {
      const sy = y < 0 ? 0 : y;
      shape[2].forEach((bitmask, row) => {
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

class Simulator {
  constructor(group) {
    this.deltas = group.split("").map((v) => (v == "<" ? -1 : 1));
    this.deltaIndex = 0;
    this.height = 0;
    this.map = new Map();
    this.start = 3;
    this.x = 0;
    this.y = 0;
  }

  simulateEmptySpace(shape) {
    // First few spaces we won't intersect the map, so just update x
    let x = 2;
    let deltaIndex = this.deltaIndex;

    for (let iter = 0; iter < this.start; ++iter) {
      const newX = x + this.deltas[deltaIndex];
      if (shapeInBounds(shape, newX)) {
        x = newX;
      }

      // Important this is here, before we potentially break below
      deltaIndex = deltaIndex == this.deltas.length - 1 ? 0 : deltaIndex + 1;
    }

    this.x = x;
    this.deltaIndex = deltaIndex;
  }

  simulateOtherSpace(shape) {
    let x = this.x;
    let y = -shape[1];
    let deltaIndex = this.deltaIndex;

    while (y + shape[1] <= this.height) {
      const newX = x + this.deltas[deltaIndex];
      if (shapeInBounds(shape, newX) && !this.map.test(shape, newX, y)) {
        x = newX;
      }

      // Important this is here, before we potentially break below
      deltaIndex = deltaIndex == this.deltas.length - 1 ? 0 : deltaIndex + 1;

      // If we're still in the empty space where we started, don't do the intersection
      if (this.map.test(shape, x, y + 1)) {
        // console.log("intersected");
        break;
      }

      ++y;
    }

    this.x = x;
    this.y = y;
    this.deltaIndex = deltaIndex;
  }

  updateMap() {
    for (; this.y < 0; ++this.y) {
      this.map.unshift(0);
      ++this.height;
    }
  }

  run(N) {
    // const startTime = performance.now();

    while (N > 0) {
      for (let rock = 0; rock < shapes.length && N > 0; ++rock, --N) {
        const shape = shapes[rock];
        this.simulateEmptySpace(shape);
        this.simulateOtherSpace(shape);
        this.updateMap();
        this.map.set(shape, this.x, this.y);
        // if (rock == 2) break;
      }
    }

    // map.dump();
    // const usPerIter = (1000 * (performance.now() - startTime)) / iters;
    // console.log(usPerIter.toFixed(3));

    return this.height;
  }
}

// Part 1

data
  .split("\n")
  .map((group) => new Simulator(group).run(2022))
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n")
  .map((group) => new Simulator(group).run(10_000_000))
  // .map((group) => new Simulator(group).run(1_000_000_000_000))
  .forEach((v) => console.log(v));
