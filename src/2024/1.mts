import { readFile } from "node:fs/promises";
import { countBy, sumOf, zip } from "../utils/collections.mts";
import { abs } from "../utils/math.mts";
import { id } from "../utils/utility.mts";

const groups = (await readFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname, "utf-8")).split("\n\n");
const readData = (data: string) => {
   return data.split("\n").reduce(([left, right], line) => {
    const [a, b] = line.split(/\s+/).map(v => BigInt(v))
    left.push(a);
    right.push(b);
    return [left, right];
  }, [[0n], [0n]]);
};

const solvePart1 = () => {
  const results = groups.map(readData).map(([left, right]) => {
    left.sort();
    right.sort();
    return zip(left, right).reduce((acc, [a, b]) => acc + abs(a - b), 0n);
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map(([left, right]) => {
    const counts = countBy(right, id);
    return sumOf(left, (item) => item * BigInt(counts.get(item) || 0));
  });

  console.log(results);
};

solvePart1();
solvePart2();