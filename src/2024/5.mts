import { sumOf } from "../utils/collections.mts";
import { readInputFile } from "../utils/utility.mts";

const groups = await readInputFile(import.meta, "\n---\n");
const readData = (data: string) => {
  const [ordering, updates] = data.split("\n\n");
  const leftRightOrdering = ordering.split("\n").map((v) => v.split("|").map((v) => Number(v)));
  const orderingMap: Record<string, number[]> = {};
  for (const [left, right] of leftRightOrdering) {
    orderingMap[left] ??= [];
    orderingMap[left].push(right);
  }

  return [orderingMap, updates.split("\n").map((v) => v.split(",").map((v) => Number(v)))] as const;
};

const pagesInWrongOrder = (orderingMap: Record<string, number[]>, update: number[]) => {
  for (let left = 0; left < update.length; left++) {
    for (let right = left + 1; right < update.length; right++) {
      const leftValue = update[left];
      const rightValue = update[right];

      const rightOrderings = orderingMap[rightValue];
      if (rightOrderings?.includes(leftValue)) {
        return [left, right];
      }
    }
  }
  return true;
};

const solvePart1 = () => {
  const results = groups.map(readData).map(([orderingMap, updates]) => {
    return sumOf(updates, (update) => {
      return pagesInWrongOrder(orderingMap, update) === true ? update[Math.floor(update.length / 2)] : 0;
    });
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map(([orderingMap, updates]) => {
    return sumOf(updates, (update) => {
      let result = pagesInWrongOrder(orderingMap, update);
      if (result === true) {
        return 0;
      }

      // Swap pages in the wrong order until the ordering becomes correct.
      // I'm not entirely certain, but this is TERRIBLY inefficient, but a cheeky way to get the result.
      while (result !== true) {
        const [left, right] = result;
        [update[left], update[right]] = [update[right], update[left]];
        result = pagesInWrongOrder(orderingMap, update);
      }

      return update[Math.floor(update.length / 2)];
    });
  });

  console.log(results);
};

solvePart1();
solvePart2();
