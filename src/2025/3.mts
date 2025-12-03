import { sumOf } from "../utils/collections.mts";

export const inputMapper = (input: string) => {
  return input.split("\n").map((line) => line.split("").map(BigInt));
};

const findMaxIndex = (line: bigint[], start: number, end: number): number => {
  let maxValue = 0n;
  let maxIndex = start;
  for (let i = start; i < end; i++) {
    if (line[i] > maxValue) {
      maxValue = line[i];
      maxIndex = i;
    }
  }
  return maxIndex;
};

const solve = (line: bigint[], numBatteries: number) => {
  const maxIndices: number[] = [];
  let start = 0;

  // We take a greedy approach, always selecting the max value available in the line, but only considering
  // a specific set of indices: all indices between the last index we chose, but trim off `index - 1` indices
  // from the end to leave room for turning on the next batteries (`line.length - index + 1` below).
  //
  // Hand-wavy proof of why this works:
  //
  // Suppose we chose battern N incorrectly, in other words, we chose a value that was
  // smaller than some other available battery. Well that means in a previous iteration we didn't choose the largest
  // possible value out of what was available, but it's clear from `findMaxIndex` that that can never happen, hence
  // we must have chosen the largest possible value out of what was available.
  for (let index = numBatteries; index > 0; --index) {
    const maxIndex = findMaxIndex(line, start, line.length - index + 1);
    maxIndices.push(maxIndex);
    start = maxIndex + 1;
  }

  return maxIndices.reduce((acc, index) => acc * 10n + line[index], 0n);
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input, (line) => solve(line, 2));
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input, (line) => solve(line, 12));
};
