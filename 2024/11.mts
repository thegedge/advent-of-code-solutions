import { sumOf } from "../utils/collections.mts";
import { memoize } from "../utils/utility.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const readData = (data: string) => {
  return data.split(" ").map((num) => BigInt(num));
};

/**
 * Calculates how many stones will be produced for the given number and number of blinks.
 */
const blink = memoize((blinks: number, num: bigint): bigint => {
  if (blinks == 0) {
    return 1n;
  }

  if (num == 0n) {
    return blink(blinks - 1, 1n);
  }

  const snum = String(num);
  if (snum.length % 2 == 0) {
    const half = Math.ceil(snum.length / 2);
    return blink(blinks - 1, BigInt(snum.slice(0, half))) + blink(blinks - 1, BigInt(snum.slice(half)));
  }

  return blink(blinks - 1, num * 2024n);
});

const solvePart1 = () => {
  const results = groups.map(readData).map((group) => {
    return sumOf(group, (num) => blink(25, num));
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((group) => {
    return sumOf(group, (num) => blink(75, num));
  });

  console.log(results);
};

solvePart1();
solvePart2();
