import { cardinalDirections, type Coordinate, dijkstra, type Graph, GridMap } from "../utils/maps.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

type Node = readonly [...Coordinate, numCheatsLeft: number];

class RacetrackMap extends GridMap<string> {
  override validCoord(coord: Coordinate): boolean {
    return super.validCoord(coord) && this.valueAt(coord) !== "#" && this.valueAt(coord) !== "$";
  }
}

class Racetrack implements Graph<string, Node, number> {
  constructor(readonly map: RacetrackMap, readonly maxCheats: number) {
    if (maxCheats >= 8) {
      throw new Error("Too many cheats");
    }
    RacetrackMap;
  }

  valueAt(node: Node): string {
    return this.map.valueAt(node as unknown as Coordinate);
  }

  keyFor(node: Node): number {
    return (this.map.keyFor(node as unknown as Coordinate) << 3) | node[2];
  }

  nodeFor(key: number): Node {
    const numCheats = key & 0b111;
    return [...this.map.nodeFor(key >> 3), numCheats];
  }

  edgeWeight(a: Node, b: Node): number {
    return this.map.edgeWeight(a as unknown as Coordinate, b as unknown as Coordinate);
  }

  neighbours(node: Node): Node[] {
    const [row, col, numCheatsLeft] = node;
    const neighbours = cardinalDirections([row, col]).map(([row, col]) => [row, col, numCheatsLeft] as const);
    if (numCheatsLeft == 0) {
      return neighbours.filter((neighbour) => this.validCoord(neighbour));
    }

    return neighbours.flatMap((neighbour) => {
      if (this.validCoord(neighbour)) {
        return [neighbour];
      }

      // We use "$" to represent a wall that has been locked down from cheating
      if (this.map.valueAt(neighbour as unknown as Coordinate) === "$") {
        return [];
      }

      return [[neighbour[0], neighbour[1], numCheatsLeft - 1]];
    });
  }

  validCoord(node: Node): boolean {
    return this.map.validCoord(node as unknown as Coordinate);
  }

  findCoord(value: string): Coordinate | undefined {
    return this.map.findCoords(value)?.[0];
  }
}

const readData = (data: string, maxCheats = 1) => {
  const map = new RacetrackMap(data.split("\n").map((line) => line.split("")));
  return new Racetrack(map, maxCheats);
};

const solvePart1 = () => {
  const results = groups.map(readData).map((racetrack) => {
    const [startRow, startCol] = racetrack.findCoord("S")!;
    const [endRow, endCol] = racetrack.findCoord("E")!;

    const shortestNoCheats = dijkstra(racetrack.map, {
      source: [startRow, startCol],
      destination: [endRow, endCol],
    });

    let numCheatsSaveAtLeast100 = 0;

    // We repeatedly apply dijkstra with cheats enabled.
    // To prevent reusing cheats, we lock down walls that have been cheated on. This means the loop
    // will find longer and longer paths until we get back to the shortest path without cheats.
    //
    // Update: I was able to run this to completion, but it's SUPER SLOW, especially as you get
    // closer to the real shortest distance
    let shortest: number = 0;
    let paths: Node[][];
    while (shortest < shortestNoCheats) {
      [shortest, paths] = dijkstra(racetrack, {
        source: [startRow, startCol, 1],
        destination: [endRow, endCol, 0],
        paths: "all",
      });

      console.log(shortestNoCheats - shortest);
      if (paths.length == 0 || shortestNoCheats - shortest < 100) {
        break;
      }

      numCheatsSaveAtLeast100 += paths.length;
      for (const path of paths) {
        for (const coord of path) {
          const mapCoord = coord as unknown as Coordinate;
          if (racetrack.map.valueAt(mapCoord) === "#") {
            racetrack.map.setValueAt(mapCoord, "$");
          }
        }
      }
    }

    return numCheatsSaveAtLeast100;
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((map) => {
    //
  });

  console.log(results);
};

solvePart1();
solvePart2();
