import { range, transpose } from "../utils/collections.mts";
import { dumpMapData, findHorizontalRuns } from "../utils/maps.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const LINE_REGEX = /p=(?<px>-?\d+),(?<py>-?\d+) v=(?<vx>-?\d+),(?<vy>-?\d+)/;

type Robot = {
  px: number;
  py: number;
  vx: number;
  vy: number;
};

const readData = (data: string) => {
  return data.split("\n").map((line): Robot => {
    const { px, py, vx, vy } = LINE_REGEX.exec(line)!.groups!;
    return {
      px: parseInt(px),
      py: parseInt(py),
      vx: parseInt(vx),
      vy: parseInt(vy),
    };
  });
};

const positionsAfter = (robots: Robot[], width: number, height: number, seconds: bigint): Robot[] => {
  return robots.map((robot) => {
    const px = Number((BigInt(robot.px) + BigInt(robot.vx) * BigInt(seconds)) % BigInt(width));
    const py = Number((BigInt(robot.py) + BigInt(robot.vy) * BigInt(seconds)) % BigInt(height));
    return {
      px: px < 0 ? px + width : px,
      py: py < 0 ? py + height : py,
      vx: robot.vx,
      vy: robot.vy,
    };
  });
};

// Computes the number of robots in each quadrant of a map with the given width and height.
//
// Any robot in the middle row/column of the grid isn't counted.
const quadrantCount = (robots: Robot[], width: number, height: number) => {
  const quadrants = [0n, 0n, 0n, 0n];
  for (const { px, py } of robots) {
    if (2 * px + 1 === width || 2 * py + 1 === height) {
      // In the middle row/column, skip.
      continue;
    }

    const quadrant = (2 * px < width ? 0 : 1) + (2 * py < height ? 0 : 2);
    quadrants[quadrant] += 1n;
  }
  return quadrants;
};

// Find a picture of a tree. Should look something like this:
//
//      ***************
//      *             *
//      *      *      *
//      *     ***     *
//      *    *****    *
//      *     ***     *
//      *    *****    *
//      *   *******   *
//      *    *****    *
//      *   *******   *
//      *  *********  *
//      *     ***     *
//      *     ***     *
//      *     ***     *
//      *             *
//      ***************
//
//  Algorithm is described inline, below, but we're going to make some assumptions:
//
//    • The tree is perfectly centered in the frame.
//    • At least
//    • Each branch of the tree is larger than the one before it, by half of its height (rounded down)
//    • There are probably only 3-5 branches.
//    • The branches are likely taller than the trunk
//    • The trunk is probably only three units tall.
//
// Given these assumptions, the above example is actually the smallest possible tree.
//
const findTreePicture = (robots: Robot[], width: number, height: number): [Robot[], number] => {
  let numMoves = 0;
  while (true) {
    // Proceed forward by one second
    numMoves += 1;
    robots = positionsAfter(robots, width, height, 1n);

    // Put this set of robots into a grid (easier to search for patterns)
    const robotsMap = range(height).map(() => range(width).map(() => false));
    for (const { px, py } of robots) {
      robotsMap[py][px] = true;
    }

    // Next, find the horizontal and vertical runs in the map. This will help us detect a frame.
    const horizontalRuns = robotsMap.map((row) => {
      return new Map(
        findHorizontalRuns(row).map(([start, length]) => {
          if (length % 2 == 0) {
            return;
          }
          return [start + (length - 1) / 2, length] as const;
        }).filter((v) => !!v),
      );
    });
    const verticalRuns = transpose(robotsMap).map((row) => {
      return new Map(
        findHorizontalRuns(row).map(([start, length]) => {
          return [start + (length - 1) / 2, length] as const;
        }).filter((v) => !!v),
      );
    });

    // Now that we have some runs, find a sufficiently long horizontal run.
    //
    // If there are sufficiently tall vertical runs on both sides, and a horizontal run at the bottom
    // of those, we've found a frame!
    //
    // The question is "what is sufficiently long?" Great question! See the function's comment for the
    // smallest possible frame we can form with our assumptions.
    const frames = [];
    horizontalRuns.forEach((rowRuns, row) => {
      for (const [center, length] of rowRuns) {
        if (length < 15) {
          continue;
        }

        const halfLength = (length - 1) / 2;
        const leftRunsMap = verticalRuns[center - halfLength];
        const rightRunsMap = verticalRuns[center + halfLength];

        const leftLength = leftRunsMap.get(row) ?? 0;
        const rightLength = rightRunsMap.get(row) ?? 0;

        // I just happened to be debugging with this, but it found the solution
        frames.push([row, center]);
        return;
        if (leftLength == rightLength && leftLength >= 16) {
          // Okay, we nearly have a frame. We have a top and two sides. Is there a bottom?
          const bottomRuns = horizontalRuns[row + leftLength];
          if (bottomRuns?.get(center) == length) {
            frames.push([row, center]);
          }
        }
      }
    });

    if (frames.length > 0) {
      return [robots, numMoves];
    }
  }
};

const debugRobots = (robots: Robot[], width: number, height: number) => {
  const robotsMap = range(height).map(() => range(width).map(() => 0n));
  for (const { px, py } of robots) {
    robotsMap[py][px] += 1n;
  }
  console.log(dumpMapData(robotsMap, { stringify: (count) => (count > 0n ? String(count) : ".") }));
};

const MAP_WIDTH = 101;
const MAP_HEIGHT = 103;

const solvePart1 = () => {
  const results = groups.map(readData).map((group) => {
    const robots = positionsAfter(group, MAP_WIDTH, MAP_HEIGHT, 100n);
    const quadrants = quadrantCount(robots, MAP_WIDTH, MAP_HEIGHT);
    return quadrants.flat().filter((count) => count > 0n).reduce((a, b) => a * b, 1n);
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((group) => {
    // Skip the first example
    if (group.length < 20) {
      return null;
    }

    const [robots, numMoves] = findTreePicture(group, MAP_WIDTH, MAP_HEIGHT);
    debugRobots(robots, MAP_WIDTH, MAP_HEIGHT);
    return numMoves;
  });

  console.log(results);
};

solvePart1();
solvePart2();
