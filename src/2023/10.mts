import { bfs } from "../utils/bfs.mts";
import { type Coordinate } from "../utils/graphs.mts";
import { GridMap } from "../utils/GridMap.mts";
import { readInputFile } from "../utils/utility.mts";

const groups = await readInputFile(import.meta);

const readData = (data: string) => {
  return new ProblemTenMap(data.split("\n").map((line) => line.split("")));
};

class ProblemTenMap extends GridMap<string> {
  override neighbours([row, col]: Coordinate): Coordinate[] {
    const value = this.data[row][col];
    switch (value) {
      case ".":
        return [];
      case "S": {
        const positions: Coordinate[] = [];
        for (const coord of super.neighbours([row, col])) {
          const coords = this.neighbours(coord);
          if (coords.some(([r, c]) => this.data[r][c] === "S")) {
            positions.push(coord);
          }
        }
        return positions;
      }
      case "-":
        return [
          [row, col - 1],
          [row, col + 1],
        ];
      case "|":
        return [
          [row - 1, col],
          [row + 1, col],
        ];
      case "J":
        return [
          [row - 1, col],
          [row, col - 1],
        ];
      case "L":
        return [
          [row - 1, col],
          [row, col + 1],
        ];
      case "7":
        return [
          [row + 1, col],
          [row, col - 1],
        ];
      case "F":
        return [
          [row + 1, col],
          [row, col + 1],
        ];
      default:
        throw new Error(`unknown value ${value}`);
    }
  }
}

const solvePart1 = () => {
  const results = groups.map(readData).map((map) => {
    let maxDistance = 0;
    bfs(map, {
      startingNodes: map.findCoords("S"),
      process: (_map, _node, distance) => {
        maxDistance = Math.max(maxDistance, distance);
      },
    });
    // console.log(dumpMapData(distances));
    // console.log();
    return maxDistance;
  });

  console.log(results);
};

const solvePart2 = () => {
  // TODO not sure how to solve this one immediately, moving on!

  const results = groups.map(readData).map((map) => {
    const startingNodes = map.findCoords("S")!;
    const loop = bfs(map, {
      startingNodes,
      process: (_map, node, distance) => {
        //
      },
    });

    // console.log(dumpMapData(loop, { stringify: (v) => (v == null ? "x" : v) }));
    // console.log();
  });

  console.log(results);
};

solvePart1();
solvePart2();
