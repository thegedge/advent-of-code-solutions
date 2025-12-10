import type { Puzzle } from "../../runner.mts";
import { maxOf, pairs } from "../utils/collections.mts";
import { segmentIntersectsRectangle, type Coordinate } from "../utils/math/geometry.mts";

export const inputMapper = (input: string) => {
  const points = input.split("\n").map((line) => line.split(",").map((v) => Number(v) - 1) as unknown as Coordinate);
  const segments = points.map((p, i) => [p, points[(i + 1) % points.length]] as [Coordinate, Coordinate]);
  return { points, segments };
};

export const solvePart1 = ({ points }: ReturnType<typeof inputMapper>) => {
  // Consider every pair of points (input is small enough to do this fast!)
  return maxOf(pairs(points), ([[x1, y1], [x2, y2]]) => {
    return rectangularArea([x1, y1], [x2, y2]);
  });
};

export const solvePart2 = ({ points, segments }: ReturnType<typeof inputMapper>, name: Puzzle["name"]) => {
  let max = 0;
  for (const [a, b] of pairs(points)) {
    const area = rectangularArea(a, b);
    if (area <= max) {
      // Any rectangles with an area less than or equal to the current max do not need to be checked
      continue;
    }

    const rectMinX = Math.min(a[0], b[0]);
    const rectMaxX = Math.max(a[0], b[0]);
    const rectMinY = Math.min(a[1], b[1]);
    const rectMaxY = Math.max(a[1], b[1]);

    // Only consider rectangles that
    if (!segments.some((segment) => segmentIntersectsRectangle(segment, [rectMinX, rectMinY], [rectMaxX, rectMaxY]))) {
      max = area;
    }
  }

  return max;
};

const rectangularArea = (a: Coordinate, b: Coordinate) => {
  return (Math.abs(b[0] - a[0]) + 1) * (Math.abs(b[1] - a[1]) + 1);
};
