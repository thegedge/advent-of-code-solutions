import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Prints the given value to the console and returns it.
 */
export const tee = <T,>(v: T): T => {
  console.log(v);
  return v;
};

/**
 * Returns the given value unchanged.
 */
export const id = <T,>(v: T): T => {
  return v;
};

/**
 * Returns true if the given value is not null or undefined.
 *
 * Used as a TypeScript narrowing function.
 */
export const nonNil = <T,>(v: T | null | undefined): v is T => {
  return v != null;
};

type MemoizedFunction<F extends (...args: never[]) => any> = F & {
  cache: Map<string, ReturnType<F>>;
};

type KeyFunction<F extends (...args: never[]) => any> = (...args: Parameters<F>) => string;

/**
 * Memoizes the given function.
 */
export const memoize = <F extends (...args: never[]) => any>(fn: F, keyFn?: KeyFunction<F>): MemoizedFunction<F> => {
  keyFn ??= (...args: any[]) => JSON.stringify(args);

  const cache = new Map<string, ReturnType<F>>();
  return Object.assign(
    ((...args: Parameters<F>) => {
      const key = keyFn(...args);
      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const value = fn(...args);
      cache.set(key, value);
      return value;
    }) as F,
    { cache }
  );
};

/**
 * Perform a binary search on the given array.
 *
 * @param array - The array to search.
 * @param value - The value to search for.
 * @param compare - The comparison function to use.
 *
 * @returns The index of the value in the array, or the index where it should be inserted.
 */
export const binarySearch = <T,>(array: T[], value: T, compare?: (a: T, b: T) => number): number => {
  const compareFn = compare ?? ((a: T, b: T) => +a - +b);

  let left = 0;
  let right = array.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const cmp = compareFn(array[mid], value);
    if (cmp === 0) {
      return mid;
    } else if (cmp < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return left;
};

/**
 * Test whether or not a given value is within an inclusive range.
 */
export const inRange = <T extends number | bigint>(value: T, lo: T, hi: T): boolean => {
  return value >= lo && value <= hi;
};

/**
 * Reads from a file.
 *
 * If the file doesn't exist, the given function is called and the result is cached at that location.
 */
export const cachedRead = memoize(async (filepath: string, f: () => string | Promise<string>) => {
  const cachePath = `.cache/${filepath}`;
  try {
    return await readFile(cachePath, "utf-8");
  } catch (error) {
    const data = await f();

    const path = dirname(cachePath);
    await mkdir(path, { recursive: true });
    await writeFile(cachePath, data);

    return data;
  }
});

/**
 * Reads JSON from a file.
 *
 * If the file doesn't exist, the given function is called and the result is cached at that location.
 */
export const cachedReadJson = memoize(
  async <T,>(filepath: string, f: () => T | Promise<T>): Promise<T> => {
    const value = await cachedRead(filepath, async () => {
      const data = await f();
      return JSON.stringify(data, null, 2);
    });
    return JSON.parse(value);
  },
  (filepath, _f) => filepath
);
