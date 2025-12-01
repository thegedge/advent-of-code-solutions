import { readFile } from "node:fs/promises";
import { id } from "../utils/utility.mts";

const groups = (await readFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname, "utf-8")).split("\n\n");

const readData = id;

const solvePart1 = () => {
  const regex = /mul\((\d+),(\d+)\)/g;
  const results = groups.map(readData).map((group) => {
    return group.matchAll(regex).reduce((value, match) => {
      return value + BigInt(match[1]) * BigInt(match[2]);
    }, 0n);
  });

  console.log(results);
};

const solvePart2 = () => {
  const regex = /mul\((\d+),(\d+)\)|don't\(\)|do\(\)/g;
  const results = groups.map(readData).map((group) => {
    let dont = false;
    return group.matchAll(regex).reduce((value, match) => {
      if (match[0].startsWith("mul")) {
        return dont ? value : value + BigInt(match[1]) * BigInt(match[2]);
      } else {
        dont = match[0].startsWith("don't");
        return value;
      }
    }, 0n);
  });

  console.log(results);
};

solvePart1();
solvePart2();
