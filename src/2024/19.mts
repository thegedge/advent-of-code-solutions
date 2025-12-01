import { sumOf } from "../utils/collections.mts";
import { memoize } from "../utils/utility.mts";

export const inputMapper = (data: string) => {
  const [patterns, designs] = data.split("\n\n");
  return [patterns.split(", "), designs.split("\n")];
};

// 626857582097410 too low

const search = memoize((design: string, patterns: string[]): bigint => {
  if (design == "") {
    return 1n;
  }

  return sumOf(patterns, (pattern) => {
    if (design.startsWith(pattern)) {
      return search(design.slice(pattern.length), patterns);
    }
    return 0n;
  });
});

export const solvePart1 = ([patterns, designs]: ReturnType<typeof inputMapper>) => {
  return sumOf(designs, (design) => (search(design, patterns) > 0n ? 1n : 0n));
};

export const solvePart2 = ([patterns, designs]: ReturnType<typeof inputMapper>) => {
  return sumOf(designs, (design) => {
    return search(design, patterns);
  });
};
