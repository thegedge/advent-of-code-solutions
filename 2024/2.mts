import { sumOf } from "std/collections/sum_of.ts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");
const readData = (data: string) => {
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
    return delta < 0 ? (diff < 0 && diff >= delta) : (diff > 0 && diff <= delta);
  });
};

const solvePart1 = () => {
  const results = groups.map(readData).map((group) => {
    return sumOf(group, (numbers) => isGood(numbers) ? 1 : 0);
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((group) => {
    return sumOf(group, (numbers) => {
      for (let indexToRemove = 0; indexToRemove < numbers.length; indexToRemove++) {
        if (isGood(numbers.toSpliced(indexToRemove, 1))) {
          return 1;
        }
      }
      return 0;
    });
  });

  console.log(results);
};

solvePart1();
solvePart2();
