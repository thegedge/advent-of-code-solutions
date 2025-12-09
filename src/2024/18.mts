import type { Puzzle } from "../../runner.mts";
import { range } from "../utils/collections.mts";
import { dijkstra } from "../utils/graphs/dijkstra.mts";
import { GridMap } from "../utils/graphs/GridMap.mts";
import { type Coordinate } from "../utils/graphs/index.mts";

class MemorySpace extends GridMap<string> {
  override validCoord(coord: Coordinate): boolean {
    return this.withinBounds(coord) && this.valueAt(coord) === ".";
  }
}

// We don't export because we need to map different for part 1 and part 2
const inputMapper = (data: string, mapSize: number, numBytes: number): MemorySpace => {
  const mapData = range(mapSize).map(() => range(mapSize).map(() => "."));
  data.split("\n").forEach((line, index) => {
    if (index > numBytes) return;
    const [col, row] = line.split(",").map((v) => parseInt(v));
    mapData[row][col] = "#";
  });
  return new MemorySpace(mapData);
};

export const solvePart1 = (data: string, name: Puzzle["name"]) => {
  const isMainInput = name == "Main input";
  const mapSize = isMainInput ? 71 : 7;
  const map = inputMapper(data, mapSize, isMainInput ? 1024 : 12);

  const dist = dijkstra(map, {
    source: [0, 0],
    destination: [mapSize - 1, mapSize - 1],
  });

  return dist;
};

export const solvePart2 = (data: string, name: Puzzle["name"]) => {
  // Not the fastest solution, but it runs in ~5s.
  // Basically problem 1, but we keep incrementing the number of bytes to fall.
  const isMainInput = name == "Main input";
  const mapSize = isMainInput ? 71 : 7;
  const bytes = data.split("\n");

  // From the previous question we know both puzzles have an answer at 1024 bytes, so we start from there
  for (let numBytes = 0; numBytes < bytes.length; ++numBytes) {
    const map = inputMapper(data, mapSize, numBytes);
    const dist = dijkstra(map, {
      source: [0, 0],
      destination: [mapSize - 1, mapSize - 1],
    });

    if (dist == Infinity) {
      return bytes[numBytes];
    }
  }
};
