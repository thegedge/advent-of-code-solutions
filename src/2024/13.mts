import { readFile } from "node:fs/promises";
import { sumOf } from "../utils/collections.mts";
import { solveSystem } from "../utils/math.mts";

const groups = (await readFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname, "utf-8")).split("\n---\n");

const LINE_REGEX = /.+?: X[+=](?<x>\d+), Y[+=](?<y>\d+)/;

const readData = (data: string) => {
  return data.split("\n\n").map((line) => {
    const [a, b, prize] = line.split("\n").map((line) => {
      const { x, y } = LINE_REGEX.exec(line)!.groups!;
      return { x: BigInt(x), y: BigInt(y) };
    });

    return { a, b, prize };
  });
};

const solvePart1 = () => {
  const results = groups.map(readData).map((group) => {
    return sumOf(group, ({ a, b, prize }) => {
      const [j, k] = solveSystem(a.x, b.x, prize.x, a.y, b.y, prize.y) || [0n, 0n];
      return 3n * j + k;
    });
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((group) => {
    return sumOf(group, ({ a, b, prize }) => {
      const [j, k] = solveSystem(a.x, b.x, 10000000000000n + prize.x, a.y, b.y, 10000000000000n + prize.y) || [0n, 0n];
      return 3n * j + k;
    });
  });

  console.log(results);
};

solvePart1();
solvePart2();
