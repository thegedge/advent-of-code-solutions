export { chunk, groupBy, merge, sortBy } from "lodash-es";

type SimpleLiteral = string | symbol | number | boolean | bigint;

/**
 * Generate an array of the given length.
 */
export const range = (n: number): number[] => {
  return [...Array(n).keys()];
};

/**
 * Generate an array of the given length with the given default value.
 */
export const arrayOf = <T,>(n: number, fnOrDefaultValue: T | ((index: number) => T)): T[] => {
  const value = fnOrDefaultValue;
  if (typeof value === "function") {
    return Array.from({ length: n }, (_, index) => (value as (index: number) => T)(index));
  }
  return Array.from({ length: n }, () => value);
};

/**
 * Returns element-wise pairs of elements from the given arrays.
 *
 * @returns {Array<[T, U]>} the zipped array.
 *
 * @example
 *  zip([1, 2, 3], ["a", "b", "c"])
 *  // returns [
 *  //   [1, "a"],
 *  //   [2, "b"],
 *  //   [3, "c"]
 *  // ]
 */
export const zip = <T, U>(a: T[], b: U[]): [T, U][] => {
  if (a.length !== b.length) {
    throw new Error("Arrays must be of the same length");
  }
  return a.map((item, index) => [item, b[index]]);
};

/**
 * Generate the Cartesian product of the given iterables.
 *
 * @yields {Array<T>} the Cartesian product of the given iterables.
 *
 * @example
 *  Array.from(cartesianProduct([1, 2], [2, 3]))
 *  // returns [
 *  //   [1, 2],
 *  //   [1, 3],
 *  //   [2, 2],
 *  //   [2, 3]
 *  // ]
 *  //
 */
export function* cartesianProduct<T>(...iterables: Iterable<T>[]): Generator<T[]> {
  const myIterable = iterables.shift();
  if (!myIterable) {
    yield [];
    return;
  }

  for (const item of myIterable) {
    yield* cartesianProduct(...iterables, [item]);
  }
}

/**
 * Sum the values of an iterable using a mapping function.
 */
export const sumOf = <T, N extends number | bigint>(iterable: Iterable<T>, fn: (item: T, index: number) => N): N => {
  let sum: N | undefined;
  let index = 0;
  for (const item of iterable) {
    if (sum === undefined) {
      sum = fn(item, index);
    } else {
      // TypeScript really doesn't like what we're doing here, but we're adults so we'll trick it
      sum = (sum as any) + fn(item, index);
    }
    index += 1;
  }

  if (sum === undefined) {
    throw new Error("sum cannot return a value for empty iterable");
  }

  return sum;
};

/**
 * Find the minimum value in an iterable using a mapping function.
 *
 * @returns The item with the minimum mapped value, or undefined if the iterable is empty.
 */
export const minBy = <T, N extends number | bigint>(
  iterable: Iterable<T>,
  fn: (item: T, index: number) => N
): T | undefined => {
  let max: T | undefined;
  let minValue: N | undefined;
  let index = 0;
  for (const item of iterable) {
    const value = fn(item, index);
    if (minValue === undefined || value < minValue) {
      minValue = value;
      max = item;
    }
    index += 1;
  }

  return max;
};

/**
 * Find the minimum value in an array using a mapping function.
 *
 * @returns The minimum mapped value, or null if the array is empty.
 */
export const minOf = <T, R extends number | bigint>(arr: T[], fn: (item: T, index: number) => R): R | undefined => {
  return arr.reduce(
    (min, item, index) => {
      const value = fn(item, index);
      if (min === undefined) {
        return value;
      }
      return min < value ? min : value;
    },
    undefined as R | undefined
  );
};

/**
 * Find the maximum value in an array using a mapping function.
 *
 * @returns The item with the maximum mapped value, or undefined if the iterable is empty.
 */
export const maxBy = <T, N extends number | bigint>(
  iterable: Iterable<T>,
  fn: (item: T, index: number) => N
): T | undefined => {
  let max: T | undefined;
  let maxValue: N | undefined;
  let index = 0;
  for (const item of iterable) {
    const value = fn(item, index);
    if (maxValue === undefined || value > maxValue) {
      maxValue = value;
      max = item;
    }
    index += 1;
  }

  return max;
};

/**
 * Find the maximum value in an array using a mapping function.
 *
 * @returns The maximum mapped value, or undefined if the iterable is empty.
 */
export const maxOf = <T, N extends number | bigint>(
  iterable: Iterable<T>,
  fn: (item: T, index: number) => N
): N | undefined => {
  let maxValue: N | undefined;
  let index = 0;
  for (const item of iterable) {
    const value = fn(item, index);
    if (maxValue === undefined || value > maxValue) {
      maxValue = value;
    }
    index += 1;
  }

  return maxValue;
};

/**
 * Count the number of distinct values produced by a selector function applied to an iterable.
 */
export const countBy = <T extends SimpleLiteral, V extends SimpleLiteral>(
  iterable: Iterable<T>,
  selector: (element: T, index: number) => V
): Map<V, number> => {
  let index = 0;
  const result = new Map<V, number>();
  for (const v of iterable) {
    const key = selector(v, index);
    result.set(key, (result.get(key) ?? 0) + 1);
    ++index;
  }
  return result;
};

/**
 * Replace all occurrences of the given target value with the replacement value.
 */
export const replaceAll = <T,>(arr: T[], target: T, replacement: T): T[] => {
  return arr.map((v) => (v === target ? replacement : v));
};

/**
 * Transpose a two-dimensional array.
 */
export const transpose = <T,>(matrix: T[][]): T[][] => {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
};

/**
 * Generate all combinations of the given array of length `n`.
 */
export const combinations = function* <T>(array: T[], n: number, from = 0): Generator<T[]> {
  if (n == 0) {
    yield [];
    return;
  }

  for (let i = from; i <= array.length - n; ++i) {
    const v = array[i];
    for (const c of combinations(array, n - 1, i + 1)) {
      yield [v, ...c];
    }
  }
};

/**
 * Generate all pairs of elements from the given array.
 */
export const pairs = function* <T>(array: T[]): Generator<[T, T]> {
  for (let i = 0; i < array.length; ++i) {
    for (let j = i + 1; j < array.length; ++j) {
      yield [array[i], array[j]];
    }
  }
};

const HOLE = Symbol("HOLE");

/**
 * Generate all distinct, non-overlapping pairs of elements from a list.
 *
 * These are considered non-distinct pairs:
 *
 *   - [1, 2], [3, 4]
 *   - [2, 1], [3, 4]
 *   - [3, 4], [1, 2]
 *
 * These are considered overlapping pairs:
 *
 *  - [1, 2], [2, 3]
 *  - [1, 2], [2, 4]
 *
 * This is slightly different from the {@linkcode combinations} function in that there are some
 * permutations of the same elements. For example, `combinations([1, 2, 3, 4, 5], 4)` would
 * only yield the first of the following pairs:
 *
 *   - [1, 2], [3, 4]
 *   - [1, 3], [2, 4]
 *   - [1, 4], [2, 3]
 *
 * It would be possible to implement this using `combinations` by permuting every combination
 * and only yielding those where chunking up in pairs of 2 would yield pairs where the first
 * element of every pair is the smaller value of the pair.
 *
 * @yields {Array<[T, T]>} pairs of elements.
 *
 * @example
 *  // returns [
 *  //   [[ 1, 2 ]]
 *  //   [[ 1, 3 ]]
 *  //   [[ 1, 4 ]]
 *  //   [[ 1, 5 ]]
 *  //   [[ 2, 3 ]]
 *  //   [[ 2, 4 ]]
 *  //   [[ 2, 5 ]]
 *  //   [[ 3, 4 ]]
 *  //   [[ 3, 5 ]]
 *  //   [[ 4, 5 ]]
 *  // ]
 * Array.from(nonOverlappingPairs([1, 2, 3, 4, 5], 2))
 *
 * @example
 *  // returns [
 *  //   [[1, 2], [3, 4]],
 *  //   [[1, 2], [3, 5]],
 *  //   [[1, 2], [4, 5]],
 *  //   [[1, 3], [2, 4]],
 *  //   [[1, 3], [2, 5]],
 *  //   [[1, 3], [4, 5]],
 *  //   [[1, 4], [2, 3]],
 *  //   [[1, 4], [2, 5]],
 *  //   [[1, 4], [3, 5]],
 *  //   [[1, 5], [2, 3]],
 *  //   [[1, 5], [2, 4]],
 *  //   [[1, 5], [3, 4]],
 *  //   [[2, 3], [4, 5]],
 *  //   [[2, 4], [3, 5]],
 *  //   [[2, 5], [3, 4]],
 *  // ]
 * Array.from(nonOverlappingPairs([1, 2, 3, 4, 5], 2))
 */
export const nonOverlappingPairs = function* <T>(list: T[], numPairs: number): Generator<[T, T][]> {
  function* recurse<T>(list: (T | typeof HOLE)[], numPairs: number, start = 0): Generator<[T, T][]> {
    if (numPairs == 0) {
      yield [];
      return;
    }

    for (let i = start; i < list.length; ++i) {
      const valueA = list[i];
      if (valueA === HOLE) {
        continue;
      }

      list[i] = HOLE;

      for (let j = i + 1; j < list.length; ++j) {
        const valueB = list[j];
        if (valueB === HOLE) {
          continue;
        }

        list[j] = HOLE;
        for (const pairs of recurse(list, numPairs - 1, i)) {
          yield [[valueA, valueB], ...pairs];
        }
        list[j] = valueB;
      }

      list[i] = valueA;
    }
  }

  yield* recurse(list, numPairs);
};
