import { range } from "../utils/collections.mts";
import { dijkstra } from "../utils/dijkstra.mts";
import { type Coordinate } from "../utils/graphs.mts";
import { GridMap } from "../utils/GridMap.mts";
import { readInputFile } from "../utils/utility.mts";

const groups = await readInputFile(import.meta);

class MemorySpace extends GridMap<string> {
  override validCoord(coord: Coordinate): boolean {
    return this.withinBounds(coord) && this.valueAt(coord) === ".";
  }
}

const readData = (data: string, mapSize: number, numBytes: number): MemorySpace => {
  const mapData = range(mapSize).map(() => range(mapSize).map(() => "."));
  data.split("\n").forEach((line, index) => {
    if (index > numBytes) return;
    const [col, row] = line.split(",").map((v) => parseInt(v));
    mapData[row][col] = "#";
  });
  return new MemorySpace(mapData);
};

const solvePart1 = () => {
  const results = groups.map((group, index) => {
    const mapSize = index == 0 ? 7 : 71;
    const map = readData(group, mapSize, index == 0 ? 12 : 1024);

    const dist = dijkstra(map, {
      source: [0, 0],
      destination: [mapSize - 1, mapSize - 1],
    });

    return dist;
  });

  console.log(results);
};

const solvePart2 = () => {
  // Not the fastest solution, but it runs in ~5s.
  // Basically problem 1, but we keep incrementing the number of bytes to fall.
  const results = groups.map((group, index) => {
    const mapSize = index == 0 ? 7 : 71;
    const bytes = group.split("\n");

    // From the previous question we know both puzzles have an answer at 1024 bytes, so we start from there
    for (let numBytes = 0; numBytes < bytes.length; ++numBytes) {
      const map = readData(group, mapSize, numBytes);
      const dist = dijkstra(map, {
        source: [0, 0],
        destination: [mapSize - 1, mapSize - 1],
      });

      if (dist == Infinity) {
        return bytes[numBytes];
      }
    }
  });

  console.log(results);
};

solvePart1();
solvePart2();
