import { range } from "lodash-es";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";

const data = await fs.readFile("./17.in", "utf8");

// My first attempt represented it as multidimensional arrays of booleans. I realized this could be
// much faster by doing boolean operations on numbers. If A & B != 0, they intersect.
/** @type {[number, number, number[], number][]} */
const rocks = [
  [4, 1, [0b11110000, 0b00000000, 0b00000000, 0b00000000], 0b11110000_00000000_00000000_00000000],
  [3, 3, [0b01000000, 0b11100000, 0b01000000, 0b00000000], 0b01000000_11100000_01000000_00000000],
  [3, 3, [0b00100000, 0b00100000, 0b11100000, 0b00000000], 0b00100000_00100000_11100000_00000000],
  [1, 4, [0b10000000, 0b10000000, 0b10000000, 0b10000000], 0b10000000_10000000_10000000_10000000],
  [2, 2, [0b11000000, 0b11000000, 0b00000000, 0b00000000], 0b11000000_11000000_00000000_00000000],
];

const MAP_WIDTH = 7;
const MAP_RANGE = range(MAP_WIDTH);

const isBitSet = (v, n) => (v & (1 << (7 - n))) != 0;
const shapeInBounds = (shape, x) => x >= 0 && x + shape[0] <= MAP_WIDTH;

class Map {
  // Making a guess here that the the max drop doesn't go beyond this max, to avoid having to allocate a ton of memory
  constructor(max = 50) {
    this.lo = 0;
    this.length = max;

    this.data = new Uint8Array(max);
    this.data.fill(0xff);
  }

  unshift(value) {
    this.lo = (this.lo - 1 + this.length) % this.length;
    this.data[this.lo] = value;
  }

  test(shape, x, y) {
    const mapVal = this.top4(x, y);
    return (shape[3] & mapVal) != 0;
  }

  top4(x, y) {
    return (
      (this.get(y + 0) << (24 + x)) |
      (this.get(y + 1) << (16 + x)) |
      (this.get(y + 2) << (8 + x)) |
      (this.get(y + 3) << x)
    );
  }

  get(row) {
    const index = this.lo + row;
    return row < 0 ? 0 : this.data[index >= this.data.length ? index - this.length : index];
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

  get hash() {
    return createHash("sha1").update(this.data).digest("base64");
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
    this.jetIndex = 0;
    this.height = 0;
    this.map = new Map();
    this.start = 3;
    this.x = 0;
    this.y = 0;
  }

  simulateEmptySpace(shape) {
    // First few spaces we won't intersect the map, so just update x
    let x = 2;
    let deltaIndex = this.jetIndex;

    for (let iter = 0; iter < this.start; ++iter) {
      const newX = x + this.deltas[deltaIndex];
      if (shapeInBounds(shape, newX)) {
        x = newX;
      }

      // Important this is here, before we potentially break below
      deltaIndex = deltaIndex == this.deltas.length - 1 ? 0 : deltaIndex + 1;
    }

    this.x = x;
    this.jetIndex = deltaIndex;
  }

  simulateOtherSpace(shape) {
    let x = this.x;
    let y = -shape[1];
    let deltaIndex = this.jetIndex;

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
    this.jetIndex = deltaIndex;
  }

  updateMap() {
    for (; this.y < 0; ++this.y) {
      this.map.unshift(0);
      ++this.height;
    }
  }

  run(N) {
    // This is our cache to hopefully find a cycle
    const cache = rocks.map(() => ({}));
    let checkCycles = true;
    for (let iter = 0; iter < N; ++iter) {
      const rock = iter % rocks.length;
      const shape = rocks[rock];

      // What we're doing here is cycle detection. If the state of the map currently is something we've seen before,
      // we know the result already, so just repeat that. I definitely struggled some to get this right. We only need
      // to do this once to really whittle this down a ton.
      if (checkCycles) {
        const key = `${this.map.hash},${this.jetIndex}`;
        if (key in cache[rock]) {
          const [seenAt, height] = cache[rock][key];

          // We need to compute the length of the cycle as the difference between current iteration and when we last
          // saw the cached state. Similarly for the height of the cycle.
          const cycleLength = iter - seenAt;
          const heightPerCycle = this.height - height;
          const repeats = Math.floor((N - iter) / cycleLength);

          // Make sure the cycle doesn't require more iterations than what we have left
          if (repeats > 0) {
            this.height += heightPerCycle * repeats;
            iter += repeats * cycleLength;
          }
        } else {
          cache[rock][key] = [iter, this.height];
        }
      }

      this.simulateEmptySpace(shape);
      this.simulateOtherSpace(shape);
      this.updateMap();
      this.map.set(shape, this.x, this.y);
    }

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
  // I didn't see it at first, but realized that this number is WAY too big to brute force. It took some time to
  // realize, but the only meaningful way to do this many iterations is to assume there are cycles, and if we can
  // detect a cycle we can quickly reduce this huge number (see Simulator#run).
  .map((group) => new Simulator(group).run(1_000_000_000_000))
  .forEach((v) => console.log(v));
