import { sumOf } from "../utils/collections.mts";

export const inputMapper = (data: string) => {
  return data.split("\n").map((line) => {
    return line.split(" ").map((item) => Number(item));
  });
};

const isGood = (numbers: number[]) => {
  if (numbers.length <= 1) {
    return true;
  }

  const delta = 3 * Math.sign(numbers[1] - numbers[0]);
  if (delta == 0) {
    return false;
  }

  return numbers.every((number, index) => {
    if (index == 0) {
      return true;
    }

    const diff = number - numbers[index - 1];
    return delta < 0 ? diff < 0 && diff >= delta : diff > 0 && diff <= delta;
  });
};

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  return sumOf(data, (numbers) => (isGood(numbers) ? 1n : 0n));
};

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
  return sumOf(data, (numbers) => {
    for (let indexToRemove = 0; indexToRemove < numbers.length; indexToRemove++) {
      if (isGood(numbers.toSpliced(indexToRemove, 1))) {
        return 1n;
      }
    }
    return 0n;
  });
};
