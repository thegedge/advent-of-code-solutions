export { deepMerge } from "std/collections/mod.ts";

export const sumOf = <T>(arr: T[], fn: (item: T, index: number) => bigint): bigint => {
  return arr.reduce((sum, item, index) => sum + fn(item, index), 0n);
};

export const max = (a: bigint, b: bigint): bigint => {
  return a > b ? a : b;
};
