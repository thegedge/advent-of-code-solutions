import { sumOf } from "./utils.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const numWinning = (line: string) => {
  const [_cardNum, numbers] = line.split(":");
  const [winning, card] = numbers.split("|").map((s) =>
    s
      .trim()
      .split(/ +/)
      .map((n) => BigInt(n.trim()))
  );

  return sumOf(winning, (n) => (card.includes(n) ? 1n : 0n));
};

const solvePart1 = () => {
  const results = groups.map((group) => {
    return sumOf(group.split("\n"), (line) => {
      const result = numWinning(line);
      return result == 0n ? 0n : 1n << (result - 1n);
    });
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map((group) => {
    const counts: Record<string, bigint> = {};
    return sumOf(group.split("\n"), (line, index) => {
      const myCount = 1n + (counts[index] || 0n);
      const num = numWinning(line);
      for (let i = 1; i <= num; i++) {
        counts[index + i] ??= 0n;
        counts[index + i] += myCount;
      }
      return myCount;
    });
  });

  console.log(results);
};

solvePart1();
solvePart2();
