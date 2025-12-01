import { sumOf } from "../utils/collections.mts";

export const inputMapper = (data: string) => {
  return data.split("\n").map((line) => line.split(" ").map(BigInt));
};

const extrapolate = (values: bigint[], backwards: boolean): bigint => {
  if (values.length == 1 || values.every((v) => v === values[0])) {
    return values[0];
  }

  const diff = values.slice(1).map((v, i) => v - values[i]);
  const value = extrapolate(diff, backwards);
  return backwards ? values[0] - value : value + values[values.length - 1];
};

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  return sumOf(data, (history) => extrapolate(history, false));
};

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
  return sumOf(data, (history) => extrapolate(history, true));
};
