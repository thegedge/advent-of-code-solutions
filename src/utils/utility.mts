import { readFile } from "node:fs/promises";

export const tee = <T,>(v: T): T => {
  console.log(v);
  return v;
};

export const id = <T,>(v: T): T => {
  return v;
};

export const nonNil = <T,>(v: T | null | undefined): v is T => {
  return v != null;
};

export const memoize = <ArgsT extends unknown[], ReturnT>(
  fn: (...args: ArgsT) => ReturnT
): ((...args: ArgsT) => ReturnT) => {
  const cache = new Map<string, ReturnT>();
  return (...args: ArgsT) => {
    const key = args.toString();
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const value = fn(...args);
    cache.set(key, value);
    return value;
  };
};

// TODO just have a wrapper script that takes a year / problem # and reads in that file, expecting some exports
//      (e.g., solvePart1, solvePart2, dataMapper) and runs it.
export const readInputFile = async (meta: ImportMeta, delimiter = "\n\n") => {
  const input = meta.filename.replace(/\.[^.]+$/, ".in");
  return (await readFile(input, "utf-8")).split(delimiter);
};
