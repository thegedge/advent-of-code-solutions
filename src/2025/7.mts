import { sumOf } from "../utils/collections.mts";
import { GridMap } from "../utils/graphs/GridMap.mts";
import type { Coordinate } from "../utils/graphs/index.mts";

export const inputMapper = (input: string) => {
  return new GridMap(input.split("\n").map((line) => line.split("")));
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  let numSplits = 0;
  const heads = input.findCoords("S");
  while (heads.length > 0) {
    for (let index = heads.length - 1; index >= 0; --index) {
      const head = heads[index];
      const newHead: Coordinate = [head[0] + 1, head[1]];
      const value = input.valueAt(newHead);
      if (value === "^") {
        numSplits++;
        heads.splice(index, 1);

        // we swap the splitter character to indicate that this is still a splitter, but we don't
        // want to double count it. If another beam hits this splitter, we ignore it.
        input.setValueAt(newHead, "v");

        for (const splits of [
          [0, -1],
          [0, 1],
        ]) {
          const splitHead: Coordinate = [newHead[0] + splits[0], newHead[1] + splits[1]];
          if (input.withinBounds(splitHead)) {
            const value = input.valueAt(splitHead);
            if (value === ".") {
              // No beam has went this path yet, so we want to traverse it
              heads.push(splitHead);
            }
          }
        }
      } else if (value === ".") {
        input.setValueAt(newHead, "|");
        heads[index] = newHead;
      } else {
        heads.splice(index, 1);
      }
    }
  }

  return numSplits;
};

// We use a dynamic programming approach to avoid recalculating the same values multiple times.
export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  const visits = new Map<number, number>();

  const recurse = (coord: Coordinate) => {
    if (!input.validCoord(coord)) {
      return 1;
    }

    const coordKey = input.keyFor(coord);
    if (visits.has(coordKey)) {
      // We've already visited this split, so just return that value
      // This is what makes it compute fast!
      return visits.get(coordKey)!;
    }

    let value: number;
    if (input.valueAt(coord) === "v") {
      value = sumOf(
        [
          [coord[0], coord[1] + 1],
          [coord[0], coord[1] - 1],
        ] as const,
        (coord) => (input.validCoord(coord) ? recurse(coord) : 0)
      );
    } else {
      value = recurse([coord[0] + 1, coord[1]]);
    }

    visits.set(coordKey, value);
    return value;
  };

  const head = input.findCoords("S")[0];
  return recurse(head);
};
