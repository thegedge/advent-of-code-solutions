import { id } from "../utils/utility.mts";

export const inputMapper = id<string>;

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  const regex = /mul\((\d+),(\d+)\)/g;
  return data.matchAll(regex).reduce((value, match) => {
    return value + BigInt(match[1]) * BigInt(match[2]);
  }, 0n);
};

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
  const regex = /mul\((\d+),(\d+)\)|don't\(\)|do\(\)/g;
  let dont = false;
  return data.matchAll(regex).reduce((value, match) => {
    if (match[0].startsWith("mul")) {
      return dont ? value : value + BigInt(match[1]) * BigInt(match[2]);
    } else {
      dont = match[0].startsWith("don't");
      return value;
    }
  }, 0n);
};
