import { sumOf } from "../utils/collections.mts";
import { memoize, readInputFile } from "../utils/utility.mts";

const groups = await readInputFile(import.meta, "\n---\n");

const readData = (data: string) => {
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

const solvePart1 = () => {
  const results = groups.map(readData).map(([patterns, designs]) => {
    return sumOf(designs, (design) => (search(design, patterns) > 0n ? 1n : 0n));
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map(([patterns, designs]) => {
    return sumOf(designs, (design) => {
      return search(design, patterns);
    });
  });

  console.log(results);
};

solvePart1();
solvePart2();
