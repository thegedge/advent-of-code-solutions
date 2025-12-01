import { maxOf, range, sumOf } from "../utils/collections.mts";

export const inputMapper = (data: string) => {
  return data.split("\n").map((v) => BigInt(v));
};

const _16777216 = (1n << 24n) - 1n; // bitwise and with this value is same as modulo 16777216

const mixAndPrune = (a: bigint, b: bigint) => {
  return (a ^ b) & _16777216;
};

const secretGenerator = function* (secret: bigint) {
  yield secret;
  while (true) {
    secret = mixAndPrune(secret, secret << 6n); // * 64
    secret = mixAndPrune(secret, secret >> 5n); // ÷ 32
    secret = mixAndPrune(secret, secret << 11n); // * 2048
    yield secret;
  }
};

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  return sumOf(data, (value) => {
    return secretGenerator(value).find((v, index) => index == 2000)!;
  });
};

// 2237 too high

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
  // Not the fastest solution, but it works.
  //
  // We just create a map that maps from a stringified version of the price differences to an array
  // of max buyer price for the price where that set of differences first occurs.
  const map = new Map<string, (bigint | null)[]>();
  data.forEach((secret, buyerIndex) => {
    const prices = secretGenerator(secret)
      .take(2001)
      .map((v) => BigInt(String(v).slice(-1)))
      .toArray();

    prices.forEach((v, index) => {
      if (index < 4) return;

      const a = prices[index - 4];
      const b = prices[index - 3];
      const c = prices[index - 2];
      const d = prices[index - 1];

      const key = `${b - a},${c - b},${d - c},${v - d}`;

      let array = map.get(key);
      if (!array) {
        array = range(data.length).map(() => null);
        map.set(key, array);
      }

      array[buyerIndex] ??= v;
    });
  });

  return maxOf(map.values(), (prices) => {
    return sumOf(prices, (v) => v ?? 0n);
  });
};
