import { sumOf } from "../utils/collections.mts";
import { Range } from "../utils/range.mts";

export const inputMapper = (input: string) => {
  // Change this if you want to map the puzzle input to something more useful
  const [rangesString, idsString] = input.split("\n\n");
  return {
    freshRanges: rangesString.split("\n").map((line) => {
      const [lo, hi] = line.split("-").map(BigInt) as [bigint, bigint];
      return new Range(lo, hi);
    }),
    ids: idsString.split("\n").map(BigInt),
  };
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input.ids, (id) => {
    for (const range of input.freshRanges) {
      if (range.includes(id)) {
        return 1n;
      }
    }
    return 0n;
  });
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  const ranges: Range<bigint>[] = [];
  while (input.freshRanges.length > 0) {
    // Pop the last range from the list
    let range = input.freshRanges.pop()!;

    // Try to merge it with any other range
    let merged = false;
    for (let i = input.freshRanges.length - 1; i >= 0; i--) {
      const maybeNewRange = range.union(input.freshRanges[i]);
      if (maybeNewRange) {
        merged = true;
        range = maybeNewRange;
        input.freshRanges.splice(i, 1);
      }
    }

    if (merged) {
      // Since we merged the range, it may still be merge-able with one of the ranges it couldn't
      // merge with at a lower index from whichever ranges it merged with.
      //
      // We achieve that by adding it back to the list.
      input.freshRanges.push(range);
    } else {
      ranges.push(range);
    }
  }

  return sumOf(ranges, (range) => range.length);
};
