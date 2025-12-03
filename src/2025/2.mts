import { sumOf } from "../utils/collections.mts";
import { id } from "../utils/utility.mts";

type Range = [bigint, bigint];

export const inputMapper = (input: string) => {
  const ranges = input.split("\n").join("").split(",");
  return ranges.map((range) => range.split("-").map(BigInt) as Range);
};

const invalidIds = function* ([start, end]: Range) {
  let invalidBase: bigint;
  const startString = String(start);
  if (startString.length % 2 == 1) {
    // 1     -> 1 1
    // 123   -> 10 10
    // 12345 -> 100 100
    // ...
    invalidBase = BigInt("1" + "0".repeat((startString.length - 1) / 2));
  } else {
    invalidBase = BigInt(startString.slice(0, startString.length / 2));

    const double = BigInt(String(invalidBase).repeat(2));
    if (double < start) {
      // Too small, just need to increment the base by 1 and we'll have a number that's >= start
      invalidBase += 1n;
    }
  }

  let doubleValue = BigInt(String(invalidBase).repeat(2));
  while (doubleValue <= end) {
    yield doubleValue;
    invalidBase++;
    doubleValue = BigInt(String(invalidBase).repeat(2));
  }
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input, (range) => {
    const invalids = Array.from(invalidIds(range));
    if (invalids.length === 0) {
      return 0n;
    }

    return sumOf(invalids, id);
  });
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  // Solve me
};
