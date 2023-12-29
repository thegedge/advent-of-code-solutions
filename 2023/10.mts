import {
  bfs,
  Coords,
  dumpMapData,
  findCoords,
  Map,
  validCoords,
} from "../utils/maps.mts";
import { nonNil } from "../utils/utility.mts";

const groups = (
  await Deno.readTextFile(
    new URL("", import.meta.url.replace(".mts", ".in")).pathname
  )
).split("\n\n");

const readData = (data: string) => {
  return data.split("\n").map((line) => line.split(""));
};

const cardinalDirections = (row: number, col: number): Coords[] => {
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];
};

const neighbours = (map: Map<string>, row: number, col: number): Coords[] => {
  const value = map.data[row][col];
  switch (value) {
    case ".":
      return [];
    case "S": {
      const positions: Coords[] = [];
      for (const [r, c] of validCoords(map, cardinalDirections(row, col))) {
        const coords = validCoords(map, map.neighbours(map, r, c));
        if (coords.some(([r, c]) => map.data[r][c] === "S")) {
          positions.push([r, c]);
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
};

const solvePart1 = () => {
  const results = groups.map(readData).map((data) => {
    const map = { data, neighbours };
    const startingCoords = findCoords(map, "S")!;
    const distances = bfs(map, {
      startingCoords,
      process: (_m, _r, _c, distance) => distance,
    });
    // console.log(dumpMap(distances));
    // console.log();
    return Math.max(...distances.map((row) => Math.max(...row.filter(nonNil))));
  });

  console.log(results);
};

const solvePart2 = () => {
  // TODO not sure how to solve this one immediately, moving on!

  const results = groups.map(readData).map((data) => {
    const map = { data, neighbours };
    const startingCoords = findCoords(map, "S")!;
    const loop = bfs(map, {
      startingCoords,
      process: (m, r, c) => m.data[r][c],
    });

    console.log(dumpMapData(loop, { stringify: (v) => (v == null ? "x" : v) }));
    console.log();
  });

  console.log(results);
};

solvePart1();
solvePart2();
