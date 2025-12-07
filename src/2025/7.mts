import type { Coordinate } from "../utils/graphs.mts";
import { GridMap } from "../utils/GridMap.mts";

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

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  // Solve me
};
