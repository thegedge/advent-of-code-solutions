import { binarySearch } from "./utility.mts";

/**
 * THe worst and laziest binary heap implementation ever.
 *
 * TODO make a proper binary heap implementation that rebalances without having to `sort` every time
 */
export class BinaryHeap<T> {
  private heap: T[];
  private compare: (a: T, b: T) => number;

  constructor(values?: Iterable<T>, compare?: (a: T, b: T) => number) {
    // We invert the comparison function to make the heap a max heap instead of a min heap,
    // which allows us to `pop` instead of `shift` the largest element, which in turn is
    // significantly more performant.
    const compareFn = compare ?? ((a: T, b: T) => +a - +b);
    this.compare = (a: T, b: T) => compareFn(b, a);

    if (values) {
      this.heap = Array.from(values);
      this.heap.sort(this.compare);
    } else {
      this.heap = [];
    }
  }

  get length(): number {
    return this.heap.length;
  }

  push(value: T) {
    const index = binarySearch(this.heap, value, this.compare);
    this.heap.splice(index, 0, value);
  }

  pop(): T | undefined {
    return this.heap.pop();
  }
}
