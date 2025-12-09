import { sumOf } from "../utils/collections.mts";
import { bfs } from "../utils/graphs/bfs.mts";
import { GridMap } from "../utils/graphs/GridMap.mts";
import { cardinalDirections, type Coordinate } from "../utils/graphs/index.mts";

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

export const inputMapper = (trail: string): Trail => {
  const data = trail.split("\n").map((line) => {
    return line.split("").map((char) => (char == "." ? null : Number(char)));
  });

  return new Trail(data);
};

export const solvePart1 = (trail: ReturnType<typeof inputMapper>) => {
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
};

export const solvePart2 = (trail: ReturnType<typeof inputMapper>) => {
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
};
