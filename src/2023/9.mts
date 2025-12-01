import { readFile } from "node:fs/promises";
import { sumOf } from "../utils/collections.mts";

const groups = (await readFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname, "utf-8")).split("\n\n");

const readData = (data: string) => {
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

const solvePart1 = () => {
  const results = groups.map(readData).map((group) => {
    return sumOf(group, (history) => extrapolate(history, false));
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((group) => {
    return sumOf(group, (history) => extrapolate(history, true));
  });

  console.log(results);
};

solvePart1();
solvePart2();
