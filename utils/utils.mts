export { chunk, deepMerge, groupBy, maxBy, minBy, sortBy, zip } from "std/collections/mod.ts";

export const sumOf = <T>(arr: T[], fn: (item: T, index: number) => bigint): bigint => {
  return arr.reduce((sum, item, index) => sum + fn(item, index), 0n);
};

export const min = <T extends bigint | number>(a: T, b: T): T => {
  return a < b ? a : b;
};

export const max = <T extends bigint | number>(a: T, b: T): T => {
  return a > b ? a : b;
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

export const range = (n: number): number[] => {
  return [...Array(n).keys()];
};

export const replaceAll = <T>(arr: T[], target: T, replacement: T): T[] => {
  return arr.map((v) => (v === target ? replacement : v));
};

export const countBy = <T extends string, V extends string>(
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
