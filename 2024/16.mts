import { dijkstra, Direction, directionDelta, DIRECTIONS, type Graph, numTurns, withinBounds } from "../utils/maps.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

type Node = [row: number, column: number, direction: Direction];

class ReindeerMap implements Graph<string, Node, number> {
  constructor(readonly data: string[][]) {}

  nodes(): Node[] {
    return this.data.flatMap((row, rowIndex) =>
      row.flatMap((_, colIndex): Node[] => {
        return DIRECTIONS.map((dir): Node => [rowIndex, colIndex, dir]).filter((n) => this.validCoord(n));
      })
    );
  }

  valueAt(node: Node): string {
    return this.data[node[0]][node[1]];
  }

  keyFor(node: Node): number {
    return (((this.data[0].length * node[0]) + node[1]) << 2) + node[2];
  }

  nodeFor(key: number): Node {
    const direction = key % 4;
    key >>= 2;
    return [Math.floor(key / this.data[0].length), key % this.data[0].length, direction];
  }

  edgeWeight(a: Node, b: Node): number {
    const distance = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    if (distance > 1) {
      // There could be a path that goes from a to b, but we'll ignore that
      return Infinity;
    }

    return distance + 1000 * numTurns(a[2], b[2]);
  }

  neighbours(node: Node): Node[] {
    return DIRECTIONS.map((dir): Node => {
      const [row, col] = directionDelta(dir);
      return [node[0] + row, node[1] + col, dir];
    }).filter((neighbour) => this.validCoord(neighbour));
  }

  validCoord(node: Node): boolean {
    return withinBounds(this.data, [node[0], node[1]]) && this.valueAt(node) !== "#";
  }

  findCoord(value: string): [row: number, col: number] | undefined {
    for (let row = 0; row < this.data.length; row++) {
      for (let col = 0; col < this.data[0].length; col++) {
        if (this.data[row][col] === value) {
          return [row, col];
        }
      }
    }
  }
}

const readData = (data: string) => {
  return new ReindeerMap(data.split("\n").map((line) => line.split("")));
};

const solvePart1 = () => {
  const results = groups.map(readData).map((map, index) => {
    const source: Node = [...map.findCoord("S")!, Direction.East];
    const dest = map.findCoord("E")!;

    // We can end up on the final destination facing any direction, so we'll try all of them and
    // take the smallest. Redundant, but worst-case complexity is the same.
    const results = DIRECTIONS.map((dir) =>
      dijkstra(map, {
        source,
        destination: [...dest, dir],
        paths: "any",
      })
    );

    return Math.min(...results.map((result) => result[0]));
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((map) => {
    const source: Node = [...map.findCoord("S")!, Direction.East];
    const dest = map.findCoord("E")!;

    // We can end up on the final destination facing any direction, so we'll try all of them and
    // take the smallest. Redundant, but worst-case complexity is the same.
    const results = DIRECTIONS.map((dir) =>
      dijkstra<unknown, Node, number>(map, {
        source,
        destination: [...dest, dir],
        paths: "all",
      })
    );

    const nodes = new Set<number>();
    const shortest = Math.min(...results.map((result) => result[0]));
    for (const result of results) {
      if (result[0] === shortest) {
        for (const path of result[1]) {
          for (const node of path) {
            nodes.add(map.keyFor(node) >> 2);
          }
        }
      }
    }

    return nodes.size;
  });

  console.log(results);
};

solvePart1();
solvePart2();
