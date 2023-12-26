export { chunk, deepMerge, minBy, zip } from "std/collections/mod.ts";

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
