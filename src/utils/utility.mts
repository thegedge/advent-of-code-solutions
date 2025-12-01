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

export const memoize = <ArgsT extends unknown[], ReturnT>(fn: (...args: ArgsT) => ReturnT): (...args: ArgsT) => ReturnT => {
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
