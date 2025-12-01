/**
 * THe worst and laziest binary heap implementation ever.
 *
 * TODO make a proper binary heap implementation that rebalances without having to `sort` every time
 */
export class BinaryHeap<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
  }

  get length(): number {
    return this.heap.length;
  }

  push(value: T) {
    this.heap.push(value);
    this.heap.sort((a, b) => this.compare(a, b));
  }

  pop(): T | undefined {
    return this.heap.shift();
  }
}
