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
