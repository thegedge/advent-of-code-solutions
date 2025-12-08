import { binarySearch } from "./utility.mts";

export type CompareFn<T> = (a: T, b: T) => number;

/**
 * A max priority queue implementation.
 */
export class PriorityQueue<T> {
  private heap: T[];
  private compare: (a: T, b: T) => number;

  constructor(values?: Iterable<T>, compare?: CompareFn<T>);
  constructor(compare: CompareFn<T>);
  /**
   * Create a new priority queue.
   *
   * @param values - The initial values to add to the queue.
   * @param compare - The comparison function to use to determine the priority of the elements.
   */
  constructor(values?: Iterable<T> | CompareFn<T>, compare?: CompareFn<T>) {
    if (typeof values === "function") {
      compare = values;
      values = undefined;
    }

    this.compare = compare ?? ((a: T, b: T) => +a - +b);
    if (values) {
      this.heap = Array.from(values);
      this.heap.sort(this.compare);
    } else {
      this.heap = [];
    }
  }

  /**
   * Get the number of elements in the queue.
   */
  get length(): number {
    return this.heap.length;
  }

  /**
   * Add a new element to the queue.
   */
  push(value: T) {
    const index = binarySearch(this.heap, value, this.compare);
    this.heap.splice(index, 0, value);
  }

  /**
   * Get the next highest priority element.
   */
  pop(): T | undefined {
    return this.heap.pop();
  }
}
