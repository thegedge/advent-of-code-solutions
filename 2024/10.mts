import { sumOf } from "std/collections/sum_of.ts";
import { bfs, Coordinate, dfs, Map } from "../utils/maps.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

class Trail extends Map<number | null> {
  neighboursFor([row, col]: Coordinate) {
    const currentValue = this.data[row][col];
    if (currentValue === null) {
      return [];
    }

    return ([
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ] as Coordinate[]).filter((coord) => this.withinBounds(coord)).filter(([row, col]) => {
      const value = this.data[row][col];
      return value ? currentValue + 1 === value : false;
    });
  }
}

const readData = (trail: string): Trail => {
  const data = trail.split("\n").map((line) => {
    return line.split("").map((char) => char == "." ? null : Number(char));
  });

  return new Trail(data);
};

const solvePart1 = () => {
  const results = groups.map(readData).map((trail) => {
    return sumOf(trail.findCoords(0), (trailhead) => {
      let peaksReached = 0;
      bfs(trail, {
        process(map, row, col, _distance) {
          if (map.data[row][col] === 9) {
            peaksReached++;
          }
        },
        startingCoords: [trailhead],
      });
      return peaksReached;
    });
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((trail) => {
    const startingCoords = trail.findCoords(0);
    const processed = dfs(trail, {
      process(map, row, col, _distance, processed: (number | null)[][]) {
        if (map.data[row][col] === 9) {
          return 1;
        }

        // From all of our neighbours, the processed array determines how many distinct paths there
        // were to 9 from that neighbour. Summing all of these values gives us the total number of
        // paths to 9 from the current cell.
        const next = map.neighbours([row, col]);
        return sumOf(next, ([row, col]) => processed[row][col] ?? 0);
      },
      startingCoords,
    });

    return sumOf(startingCoords, ([row, col]) => processed[row][col] || 0);
  });

  console.log(results);
};

solvePart1();
solvePart2();
