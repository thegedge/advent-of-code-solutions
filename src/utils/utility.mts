import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

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
export const cachedReadJson = memoize(async <T,>(filepath: string, f: () => T | Promise<T>): Promise<T> => {
  const value = await cachedRead(filepath, async () => {
    const data = await f();
    return JSON.stringify(data, null, 2);
  });
  return JSON.parse(value);
});
