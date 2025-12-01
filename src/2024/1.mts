import { countBy, sumOf, zip } from "../utils/collections.mts";
import { abs } from "../utils/math.mts";
import { id } from "../utils/utility.mts";

export const inputMapper = (data: string) => {
  return data.split("\n").reduce(
    ([left, right], line) => {
      const [a, b] = line.split(/\s+/).map((v) => BigInt(v));
      left.push(a);
      right.push(b);
      return [left, right];
    },
    [[0n], [0n]]
  );
};

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  const [left, right] = data;
  left.sort();
  right.sort();
  return zip(left, right).reduce((acc, [a, b]) => acc + abs(a - b), 0n);
};

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
  const [left, right] = data;
  const counts = countBy(right, id);
  return sumOf(left, (item) => item * BigInt(counts.get(item) || 0));
};
