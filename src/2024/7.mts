import { sumOf } from "../utils/collections.mts";
import { readInputFile } from "../utils/utility.mts";

const groups = await readInputFile(import.meta);
const readData = (data: string) => {
  return data.split("\n").map((line) => {
    const [result, numbers] = line.split(":");
    return [BigInt(result), numbers.split(" ").map((v) => BigInt(v))] as const;
  });
};

type Operator = (a: bigint, b: bigint) => bigint;

const solve = (target: bigint, numbers: bigint[], operators: Operator[]) => {
  const recurse = (value: bigint, numbers: bigint[]): boolean => {
    if (value == target && numbers.length == 0) {
      return true;
    }

    if (numbers.length == 0) {
      return false;
    }

    return operators.some((operator) => {
      return recurse(operator(value, numbers[0]), numbers.slice(1));
    });
  };

  const value = numbers.shift()!;
  return recurse(value, numbers);
};

const solvePart1 = () => {
  const operators = [(a: bigint, b: bigint) => a + b, (a: bigint, b: bigint) => a * b];

  const results = groups.map(readData).map((group) => {
    return sumOf(group, ([result, numbers]) => {
      return solve(result, numbers, operators) ? result : 0n;
    });
  });

  console.log(results);
};

const solvePart2 = () => {
  const operators = [
    (a: bigint, b: bigint) => a + b,
    (a: bigint, b: bigint) => a * b,
    (a: bigint, b: bigint) => BigInt(String(a) + String(b)),
  ];

  const results = groups.map(readData).map((group) => {
    return sumOf(group, ([result, numbers]) => {
      return solve(result, numbers, operators) ? result : 0n;
    });
  });

  console.log(results);
};

solvePart1();
solvePart2();
