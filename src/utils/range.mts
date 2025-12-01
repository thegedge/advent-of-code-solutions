import { max, min } from "./math.mts";

export class Range {
  public readonly length: number;
  public readonly lo: number;
  public readonly hi: number;

  static span(lo: number, length: number): Range {
    return new Range(lo, lo + length - 1);
  }

  constructor(lo: number, hi: number) {
    if (lo > hi) {
      throw new Error(`Invalid range: ${lo} > ${hi}`);
    }

    this.lo = lo;
    this.hi = hi;
    this.length = this.hi - this.lo + 1;
  }

  overlaps(range: Range): boolean {
    return this.lo <= range.hi && this.hi >= range.lo;
  }

  intersect(range: Range): Range | null {
    if (!this.overlaps(range)) {
      return null;
    }

    return new Range(max(this.lo, range.lo), min(this.hi, range.hi));
  }

  /**
   * Like {@linkcode intersect}, but also returns the parts of the given range that are not overlapping this range.
   */
  partition(range: Range): [overlapping: Range | null, nonOverlapping: Range[]] {
    const overlapping = this.intersect(range);
    if (!overlapping) {
      return [null, [range]];
    }

    if (range.lo < this.lo && range.hi <= this.hi) {
      return [overlapping, [new Range(range.lo, this.lo - 1)]];
    } else if (range.lo >= this.lo && range.hi > this.hi) {
      return [overlapping, [new Range(this.hi + 1, range.hi)]];
    } else if (range.lo >= this.lo && range.hi <= this.hi) {
      return [overlapping, []];
    } else {
      // This range is completely contained in the given range
      return [overlapping, [new Range(range.lo, this.lo - 1), new Range(this.hi + 1, range.hi)]];
    }
  }

  includes(value: number): boolean {
    return value >= this.lo && value <= this.hi;
  }

  toString(): string {
    return `(${this.lo}, ${this.hi})`;
  }

  [Symbol.for("Deno.customInspect")](): string {
    return this.toString();
  }
}
