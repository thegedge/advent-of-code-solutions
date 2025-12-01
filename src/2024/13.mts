import { sumOf } from "../utils/collections.mts";
import { solveSystem } from "../utils/math.mts";

const LINE_REGEX = /.+?: X[+=](?<x>\d+), Y[+=](?<y>\d+)/;

export const inputMapper = (data: string) => {
  return data.split("\n\n").map((line) => {
    const [a, b, prize] = line.split("\n").map((line) => {
      const { x, y } = LINE_REGEX.exec(line)!.groups!;
      return { x: BigInt(x), y: BigInt(y) };
    });

    return { a, b, prize };
  });
};

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  return sumOf(data, ({ a, b, prize }) => {
    const [j, k] = solveSystem(a.x, b.x, prize.x, a.y, b.y, prize.y) || [0n, 0n];
    return 3n * j + k;
  });
};

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
  return sumOf(data, ({ a, b, prize }) => {
    const [j, k] = solveSystem(a.x, b.x, 10000000000000n + prize.x, a.y, b.y, 10000000000000n + prize.y) || [0n, 0n];
    return 3n * j + k;
  });
};
