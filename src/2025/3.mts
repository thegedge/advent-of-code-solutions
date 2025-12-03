import { sumOf } from "../utils/collections.mts";
import { id } from "../utils/utility.mts";

export const inputMapper = (input: string) => {
  return input.split("\n").map((line) => line.split("").map(BigInt));
};

const solve = (line: bigint[], numBatteries: number) => {
  line.sort();
  return sumOf(line.slice(-numBatteries), id);
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input, (line) => solve(line, 2));
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input, (line) => solve(line, 12));
};
