import { arrayOf, sumOf } from "../collections.mts";
import { memoize } from "../utility.mts";

/**
 * A two-dimensional shape on an integer grid.
 */
export class GridShape {
  #mask: readonly (readonly boolean[])[];
  #bigints: bigint[];

  static fromString(string: string) {
    return new GridShape(string.split("\n").map((line) => line.split("").map((char) => char === "#")));
  }

  constructor(mask: readonly (readonly boolean[])[]) {
    this.#mask = mask;
    this.#bigints = mask.map((row) => row.reduce((acc, cell) => (acc << 1n) | (cell ? 1n : 0n), 0n));
  }

  get coveredArea() {
    return this.width * this.height;
  }

  get area() {
    return sumOf(this.#mask, (row) => sumOf(row, (cell) => (cell ? 1 : 0)));
  }

  get width() {
    return this.#mask[0].length;
  }

  get height() {
    return this.#mask.length;
  }

  /**
   * Adjust the width/height of the shape to the given dimensions.
   *
   * @example
   *
   * ..#..
   * .###.
   * ..#..
   *
   * resize(5, 5)
   * ..#...
   * .###..
   * ..#...
   * ......
   * ......
   *
   * resize(2, 2)
   * ..#
   * .##
   */
  resized(width: number, height: number): GridShape {
    const mask = arrayOf(height, () => arrayOf(width, false));
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        mask[row][col] = this.#mask[row][col];
      }
    }
    return new GridShape(mask);
  }

  /**
   * Shifts the shape by the given offset.
   *
   * @example
   *
   * .....
   * ..#..
   * .###.
   * ..#..
   * .....
   *
   * shift(1, 1)
   * .....
   * .....
   * ...#.
   * ..###
   * ...#.
   *
   * shift(2, 2)
   * ....#
   * .....
   * .....
   * ....#
   * #..##
   *
   * shift(3, 3)
   * ##..#
   * #....
   * .....
   * .....
   * #....
   */
  shifted(offsetX: number, offsetY: number): GridShape {
    const mask = arrayOf(this.height, () => arrayOf(this.width, false));
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        mask[(row + offsetY) % this.height][(col + offsetX) % this.width] = this.#mask[row][col];
      }
    }
    return new GridShape(mask);
  }

  union(other: GridShape): GridShape {
    if (this.width !== other.width || this.height !== other.height) {
      throw new Error("can only union shapes that have the same width and height");
    }

    const mask = arrayOf(this.height, () => arrayOf(this.width, false));
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        mask[row][col] = this.#mask[row][col] || other.#mask[row][col];
      }
    }
    return new GridShape(mask);
  }

  rotatedClockwise(): GridShape {
    const mask = arrayOf(this.width, () => arrayOf(this.height, false));
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        mask[col][this.height - row - 1] = this.#mask[row][col];
      }
    }
    return new GridShape(mask);
  }

  rotatedCounterClockwise(): GridShape {
    const mask = arrayOf(this.width, () => arrayOf(this.height, false));
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        mask[this.width - col - 1][row] = this.#mask[row][col];
      }
    }
    return new GridShape(mask);
  }

  intersects(other: GridShape): boolean {
    for (let row = 0; row < Math.min(this.height, other.height); row++) {
      const thisMask = this.#bigints[row];
      const otherMask = other.#bigints[row];
      if (this.width > other.width) {
        if (((thisMask >> BigInt(this.width - other.width)) & otherMask) !== 0n) {
          return true;
        }
      } else if (this.width < other.width) {
        if ((thisMask & (otherMask >> BigInt(other.width - this.width))) !== 0n) {
          return true;
        }
      } else {
        if ((thisMask & otherMask) !== 0n) {
          return true;
        }
      }
    }
    return false;
  }

  toBigInt = memoize(() => {
    return this.#bigints.reduce((acc, bigint) => (acc << BigInt(this.width)) | bigint, 0n);
  });

  toString() {
    return this.#mask.map((row) => row.map((cell) => (cell ? "#" : ".")).join("")).join("\n");
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toString();
  }

  [Symbol.toPrimitive](_hint: "string" | "number" | "default") {
    return this.toString();
  }
}
