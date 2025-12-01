import { sumOf } from "../utils/collections.mts";

export const inputMapper = (data: string) => {
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

export const solvePart1 = ([orderingMap, updates]: ReturnType<typeof inputMapper>) => {
  return sumOf(updates, (update) => {
    return pagesInWrongOrder(orderingMap, update) === true ? update[Math.floor(update.length / 2)] : 0;
  });
};

export const solvePart2 = ([orderingMap, updates]: ReturnType<typeof inputMapper>) => {
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
};
