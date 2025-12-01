import { sumOf } from "../utils/collections.mts";

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

export const inputMapper = (data: string) => {
  return data.split("\n").map((line) => numWinning(line));
};

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  return sumOf(data, (num) => {
    return num == 0n ? 0n : 1n << (num - 1n);
  });
};

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
  const counts: Record<string, bigint> = {};
  return sumOf(data, (num, index) => {
    const myCount = 1n + (counts[index] || 0n);
    for (let i = 1; i <= num; i++) {
      counts[index + i] ??= 0n;
      counts[index + i] += myCount;
    }
    return myCount;
  });
};
