import { sumOf } from "../utils/collections.mts";

export const inputMapper = (input: string) => {
  return input.split("\n").map((line) => line.split("").map(BigInt));
};

const findMaxIndex = (line: bigint[], fromIndex = 0): number => {
  let maxValue = 0n;
  let maxIndex = -1;
  for (let i = fromIndex; i < line.length; i++) {
    if (line[i] > maxValue) {
      maxValue = line[i];
      maxIndex = i;
    }
  }
  return maxIndex;
};

const solve = (line: bigint[], numBatteries: number) => {
  const maxIndices: number[] = [];
  let lineToConsider = [...line];
  for (let index = 0; index < numBatteries; index++) {
    const maxIndex = findMaxIndex(lineToConsider);
    maxIndices.push(maxIndex);
    if (maxIndex == lineToConsider.length - 1) {
      lineToConsider = lineToConsider.slice(0, -1);
    }
  }

  if (numBatteries == 2) {
    console.log(maxIndices, line);
  }

  maxIndices.sort();
  return maxIndices.reduce((acc, index) => acc * 10n + line[index], 0n);
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input, (line) => solve(line, 2));
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input, (line) => solve(line, 12));
};
