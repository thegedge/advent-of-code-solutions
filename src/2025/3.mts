import { sumOf } from "../utils/collections.mts";

export const inputMapper = (input: string) => {
  return input.split("\n").map((line) => line.split("").map(Number));
};

const findMaxIndex = (line: number[], fromIndex = 0) => {
  let maxValue = 0;
  let maxIndex = -1;
  for (let i = fromIndex; i < line.length; i++) {
    if (line[i] > maxValue) {
      maxValue = line[i];
      maxIndex = i;
    }
  }
  return maxIndex;
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input, (line) => {
    let maxIndexA = findMaxIndex(line);
    let maxIndexB: number;
    if (maxIndexA == line.length - 1) {
      maxIndexB = maxIndexA;
      maxIndexA = findMaxIndex(line.slice(0, -1));
    } else {
      maxIndexB = findMaxIndex(line, maxIndexA + 1);
    }

    return 10 * line[maxIndexA] + line[maxIndexB];
  });
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  // Solve me
};
