import { sumOf } from "../utils/collections.mts";
import { GridMap } from "../utils/graphs/GridMap.mts";
import { surroundingDirections } from "../utils/graphs/index.mts";

export const inputMapper = (input: string) => {
  const cellData = input.split("\n").map((line) => {
    return line.split("").map((v) => v == "@");
  });
  return new GridMap(cellData, surroundingDirections);
};

const removable = (grid: GridMap<boolean>) => {
  return grid.nodes().filter((node) => {
    const value = grid.valueAt(node);
    if (!value) {
      return false;
    }

    const neighbours = grid.neighbours(node);
    const numNeighbours = sumOf(neighbours, (neighbour) => (grid.valueAt(neighbour) ? 1n : 0n));
    return numNeighbours < 4;
  });
};

export const solvePart1 = (grid: ReturnType<typeof inputMapper>) => {
  return removable(grid).toArray().length;
};

export const solvePart2 = (grid: ReturnType<typeof inputMapper>) => {
  let sum = 0;
  let removableNodes = removable(grid).toArray();
  while (removableNodes.length > 0) {
    sum += removableNodes.length;
    for (const node of removableNodes) {
      grid.setValueAt(node, false);
    }
    removableNodes = removable(grid).toArray();
  }
  return sum;
};
