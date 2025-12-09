import { sumOf } from "../utils/collections.mts";
import { Range } from "../utils/range.mts";
import { id } from "../utils/utility.mts";

type RangePair = [lo: bigint, hi: bigint];

export const inputMapper = (input: string) => {
  const ranges = input.split("\n").join("").split(",");
  return ranges.map((range) => range.split("-").map(BigInt) as RangePair);
};

/**
 * Given a start/end range, produce all numbers that have repeated runs of a given length
 */
const invalidIdsWithRuns = function* ([start, end]: RangePair, numRuns: number) {
  let invalidBase: bigint;
  const startString = String(start);
  if (startString.length % numRuns == 0) {
    invalidBase = BigInt(startString.slice(0, startString.length / numRuns));

    const double = BigInt(String(invalidBase).repeat(numRuns));
    if (double < start) {
      // Too small, just need to increment the base by 1 and we'll have a number that's >= start
      invalidBase += 1n;
    }
  } else {
    // Starting number can't evenly divide into `numRuns`, so we find the smallest base that will
    // produce a number that has `numRuns` repeated runs and is >= start
    //
    // numRuns = 2:
    //   1     -> 1 1
    //   123   -> 10 10
    //   12345 -> 100 100
    //   ...
    //
    // numRuns = 3:
    //   1       -> 1 1 1
    //   123     -> 10 10 10
    //   1234    -> 10 10 10
    //   12345   -> 10 10 10
    //   1234567 -> 100 100 100
    //   ...
    //
    invalidBase = BigInt("1" + "0".repeat(Math.floor(startString.length / numRuns)));
  }

  let doubleValue = BigInt(String(invalidBase).repeat(numRuns));
  while (doubleValue <= end) {
    yield doubleValue;
    invalidBase++;
    doubleValue = BigInt(String(invalidBase).repeat(numRuns));
  }
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input, (range) => {
    const invalids = Array.from(invalidIdsWithRuns(range, 2));
    if (invalids.length === 0) {
      return 0n;
    }

    return sumOf(invalids, id);
  });
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input, (range) => {
    const maxRuns = String(range[1]).length;
    const seen = new Set<bigint>();
    return sumOf(new Range(2, maxRuns), (numRuns) => {
      const invalids = Array.from(invalidIdsWithRuns(range, numRuns));
      if (invalids.length === 0) {
        return 0n;
      }

      return sumOf(invalids, (value) => {
        if (seen.has(value)) {
          return 0n;
        }
        seen.add(value);
        return value;
      });
    });
  });
};
