export { cartesianProduct } from "https://deno.land/x/combinatorics@1.1.2/mod.ts";
export { chunk, deepMerge, groupBy, maxBy, minBy, sortBy, zip } from "std/collections/mod.ts";

type SimpleLiteral = string | symbol | number | boolean | bigint;

export const range = (n: number): number[] => {
  return [...Array(n).keys()];
};

export const sumOf = <T,>(iterable: Iterable<T>, fn: (item: T, index: number) => bigint): bigint => {
  let sum = 0n;
  let index = 0;
  for (const item of iterable) {
    sum += fn(item, index);
    index += 1;
  }
  return sum;
};

export const countBy = <T extends SimpleLiteral, V extends SimpleLiteral>(
  iterable: Iterable<T>,
  selector: (element: T, index: number) => V,
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

export const replaceAll = <T,>(arr: T[], target: T, replacement: T): T[] => {
  return arr.map((v) => (v === target ? replacement : v));
};

export const transpose = <T,>(matrix: T[][]): T[][] => {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
};

export const minMap = <T, R extends number | bigint>(arr: T[], fn: (item: T, index: number) => R): R | null => {
  return arr.reduce((min, item, index) => {
    const value = fn(item, index);
    if (min === null) {
      return value;
    }
    return min < value ? min : value;
  }, null as R | null);
};

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
