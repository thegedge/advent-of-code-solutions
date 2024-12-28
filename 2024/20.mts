import { bfs } from "../utils/bfs.mts";
import { type Coordinate } from "../utils/graphs.mts";
import { GridMap } from "../utils/GridMap.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

type Node = readonly [...Coordinate, numCheatsLeft: number];

class Racetrack extends GridMap<string> {
  override validCoord(coord: Coordinate): boolean {
    return super.validCoord(coord) && this.valueAt(coord) !== "#";
  }
}

const readData = (data: string) => {
  return new Racetrack(data.split("\n").map((line) => line.split("")));
};

const solve = (racetrack: Racetrack, cheatLength: number) => {
  const start = racetrack.findCoords("S")[0];
  const end = racetrack.findCoords("E")[0];

  // Get all the distances from the goal
  const distancesFromEnd = new Map<number, number>();
  bfs(racetrack, {
    startingNodes: [end],
    process: (map, node, distance, alreadyVisited) => {
      if (!alreadyVisited) {
        distancesFromEnd.set(map.keyFor(node), distance);
      }
    },
  });

  const shortestDistanceWithoutCheats = distancesFromEnd.get(racetrack.keyFor(start))!;

  // For all nodes we processed, see if we can reach the destination with a cheat more quickly
  let count = 0n;
  for (const [key, distanceFromEnd] of distancesFromEnd.entries()) {
    const node = racetrack.nodeFor(key);

    // So we're currently looking at a node in the graph. Let's consider all of its numbers within a "one cheat" distance.
    // If we can reach the destination from any of these nodes and save at least 100 picoseconds, increment the count.
    for (let rowDelta = -cheatLength; rowDelta <= cheatLength; rowDelta++) {
      const rowAbs = Math.abs(rowDelta);

      // This weird loop is to create a "diamond" like structure that looks something like this:
      //
      //     #
      //    ###
      //   #####
      //    ###
      //     #
      //
      for (let colDelta = -cheatLength + rowAbs; colDelta <= cheatLength - rowAbs; colDelta++) {
        const cheatNeighbour: Coordinate = [node[0] + rowDelta, node[1] + colDelta];
        if (!racetrack.validCoord(cheatNeighbour)) {
          continue;
        }

        const neighbourDistanceFromEnd = distancesFromEnd.get(racetrack.keyFor(cheatNeighbour));
        if (neighbourDistanceFromEnd == undefined) {
          // No path from this neighbour (where we cheated) to the end
          continue;
        }

        // Did we save at least 100 picoseconds?
        const distanceFromStart = shortestDistanceWithoutCheats - distanceFromEnd;
        const cheatDistance = distanceFromStart + neighbourDistanceFromEnd + Math.abs(rowDelta) + Math.abs(colDelta);
        if (100 + cheatDistance <= shortestDistanceWithoutCheats) {
          count++;
        }
      }
    }
  }
  return count;
};

const solvePart1 = () => {
  const results = groups.map(readData).map((racetrack) => {
    return solve(racetrack, 2);
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((racetrack) => {
    return solve(racetrack, 20);
  });

  console.log(results);
};

solvePart1();
solvePart2();
