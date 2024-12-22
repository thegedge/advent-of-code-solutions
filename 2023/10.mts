import { maxOf } from "std/collections/mod.ts";
import { bfs, Coordinate, GridMap } from "../utils/maps.mts";
import { id } from "../utils/utility.mts";

const groups = (
  await Deno.readTextFile(
    new URL("", import.meta.url.replace(".mts", ".in")).pathname,
  )
).split("\n\n");

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
    const startingNodes = map.findCoords("S");
    const distances = bfs(map, { startingNodes });
    // console.log(dumpMapData(distances));
    // console.log();
    return maxOf(Array.from(distances.values()), id);
  });

  console.log(results);
};

const solvePart2 = () => {
  // TODO not sure how to solve this one immediately, moving on!

  const results = groups.map(readData).map((map) => {
    const startingNodes = map.findCoords("S")!;
    const loop = bfs(map, {
      startingNodes,
    });

    // console.log(dumpMapData(loop, { stringify: (v) => (v == null ? "x" : v) }));
    // console.log();
  });

  console.log(results);
};

solvePart1();
solvePart2();
