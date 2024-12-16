import { range } from "../utils/collections.mts";
import { dumpMapData } from "../utils/maps.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const LINE_REGEX = /p=(?<px>-?\d+),(?<py>-?\d+) v=(?<vx>-?\d+),(?<vy>-?\d+)/;

type Robot = {
  px: bigint;
  py: bigint;
  vx: bigint;
  vy: bigint;
};

const readData = (data: string) => {
  return data.split("\n").map((line): Robot => {
    const { px, py, vx, vy } = LINE_REGEX.exec(line)!.groups!;
    return {
      px: BigInt(px),
      py: BigInt(py),
      vx: BigInt(vx),
      vy: BigInt(vy),
    };
  });
};

const positionsAfter = (robots: Robot[], width: number, height: number, seconds: bigint): Robot[] => {
  return robots.map((robot) => {
    const px = (robot.px + robot.vx * BigInt(seconds)) % BigInt(width);
    const py = (robot.py + robot.vy * BigInt(seconds)) % BigInt(height);
    return {
      px: px < 0 ? px + BigInt(width) : px,
      py: py < 0 ? py + BigInt(height) : py,
      vx: robot.vx,
      vy: robot.vy,
    };
  });
};

// Computes the number of robots in each quadrant of a map with the given width and height.
//
// Any robot in the middle row/column of the grid isn't counted.
const quadrantCount = (robots: Robot[], width: number, height: number) => {
  const widthBig = BigInt(width);
  const heightBig = BigInt(height);
  const quadrants = [0n, 0n, 0n, 0n];
  for (const { px, py } of robots) {
    if (2n * px + 1n === widthBig || 2n * py + 1n === heightBig) {
      // In the middle row/column, skip.
      continue;
    }

    const quadrant = (2n * px < widthBig ? 0 : 1) + (2n * py < heightBig ? 0 : 2);
    quadrants[quadrant] += 1n;
  }
  return quadrants;
};

const debugRobots = (robots: Robot[], width: number, height: number) => {
  const robotsMap = range(height).map(() => range(width).map(() => 0n));
  for (const { px, py } of robots) {
    robotsMap[Number(py)][Number(px)] += 1n;
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
    //
  });

  console.log(results);
};

solvePart1();
solvePart2();
