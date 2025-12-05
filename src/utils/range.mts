import { max, min } from "./math.mts";

// TODO remove all of the `as any` once something like
//      https://github.com/Microsoft/TypeScript/issues/27808 is supported

export class Range<T extends number | bigint = number> {
  public readonly lo: T;
  public readonly hi: T;
  public readonly length: number;

  private readonly ONE: T;

  static span<T extends number | bigint>(lo: T, length: T): Range<T> {
    return new Range(lo, lo + ((length - 1) as any));
  }

  /**
   * Creates a new range from a lower and upper bound.
   *
   * @param lo - The lower bound of the range (inclusive).
   * @param hi - The upper bound of the range (inclusive).
   */
  constructor(lo: T, hi: T) {
    if (lo > hi) {
      throw new Error(`Invalid range: ${lo} > ${hi}`);
    }

    this.ONE = (typeof lo === "number" ? 1 : 1n) as any;

    this.lo = lo;
    this.hi = hi;
    this.length = this.hi - this.lo + (this.ONE as any);
  }

  includes(value: T): boolean {
    return value >= this.lo && value <= this.hi;
  }

  overlaps(range: Range<T>): boolean {
    return this.lo <= range.hi && this.hi >= range.lo;
  }

  /**
   * If overlapping, returns the smallest range that contains both this and the given range.
   */
  union(range: Range<T>): Range<T> | null {
    if (!this.overlaps(range)) {
      return null;
    }

    return new Range(min(this.lo, range.lo), max(this.hi, range.hi));
  }

  /**
   * If overlapping, returns the largest range that is contained in both this and the given range.
   */
  intersect(range: Range<T>): Range<T> | null {
    if (!this.overlaps(range)) {
      return null;
    }

    return new Range(max(this.lo, range.lo), min(this.hi, range.hi));
  }

  /**
   * Like {@linkcode intersect}, but also returns the parts of the given range that are not overlapping this range.
   */
  partition(range: Range<T>): [overlapping: Range<T> | null, nonOverlapping: Range<T>[]] {
    const overlapping = this.intersect(range);
    if (!overlapping) {
      return [null, [range]];
    }

    if (range.lo < this.lo && range.hi <= this.hi) {
      return [overlapping, [new Range(range.lo, (this.lo - 1) as T)]];
    } else if (range.lo >= this.lo && range.hi > this.hi) {
      // @ts-expect-error -- `hi` and `ONE` are the same type
      return [overlapping, [new Range(this.hi + this.ONE, range.hi)]];
    } else if (range.lo >= this.lo && range.hi <= this.hi) {
      return [overlapping, []];
    } else {
      // This range is completely contained in the given range
      return [overlapping, [new Range(range.lo, (this.lo - 1) as T), new Range(this.hi + (this.ONE as any), range.hi)]];
    }
  }

  toString(): string {
    return `${this.lo} — ${this.hi}`;
  }

  [Symbol.iterator](): Iterator<T> {
    const object = {
      current: this.lo,
      end: this.hi,

      next(): IteratorResult<T> {
        if (this.current > this.end) {
          return { done: true, value: undefined };
        }
        return { done: false, value: this.current++ } as any;
      },
    };
    return object;
  }

  [Symbol.toPrimitive](hint?: "number" | "string" | "default"): number | string {
    if (hint === "number") {
      return Number(this.lo);
    }

    return this.toString();
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString();
  }

  [Symbol.for("Deno.customInspect")](): string {
    return this.toString();
  }
}
