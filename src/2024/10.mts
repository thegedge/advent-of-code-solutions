import { bfs } from "../utils/bfs.mts";
import { sumOf } from "../utils/collections.mts";
import { cardinalDirections, type Coordinate } from "../utils/graphs.mts";
import { GridMap } from "../utils/GridMap.mts";
import { readInputFile } from "../utils/utility.mts";

const groups = await readInputFile(import.meta);

class Trail extends GridMap<number | null> {
  override neighbours([row, col]: Coordinate) {
    const currentValue = this.data[row][col];
    if (currentValue === null) {
      return [];
    }

    return cardinalDirections([row, col])
      .filter((coord) => this.withinBounds(coord))
      .filter(([row, col]) => {
        const value = this.data[row][col];
        return value ? currentValue + 1 === value : false;
      });
  }
}

const readData = (trail: string): Trail => {
  const data = trail.split("\n").map((line) => {
    return line.split("").map((char) => (char == "." ? null : Number(char)));
  });

  return new Trail(data);
};

const solvePart1 = () => {
  const results = groups.map(readData).map((trail) => {
    return sumOf(trail.findCoords(0), (trailhead) => {
      let peaksReached = 0n;
      bfs(trail, {
        startingNodes: [trailhead],
        process(map, node, _distance, alreadyVisited) {
          if (!alreadyVisited && map.valueAt(node) === 9) {
            peaksReached++;
          }
        },
      });
      return peaksReached;
    });
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((trail) => {
    return sumOf(trail.findCoords(0), (trailhead) => {
      let peaksReached = 0n;
      bfs(trail, {
        startingNodes: [trailhead],
        process(map, node) {
          if (map.valueAt(node) === 9) {
            peaksReached++;
          }

          // Continue processing this node, even if we already visited it
          return true;
        },
      });
      return peaksReached;
    });
  });

  console.log(results);
};

solvePart1();
solvePart2();
