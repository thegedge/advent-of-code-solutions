import { max, sum } from "lodash-es";
import fs from "node:fs/promises";

const distanceToBlockingTree = (heights, row, col, rowDelta, colDelta) => {
  let distance = 1;
  const height = heights[row][col];
  row += rowDelta;
  col += colDelta;
  while (row >= 0 && col >= 0 && row < heights.length && col < heights[0].length) {
    if (heights[row][col] >= height) {
      return -distance;
    }
    row += rowDelta;
    col += colDelta;
    distance += 1;
  }
  return distance - 1;
};

const visible = (heights, row, col) => {
  const visible =
    distanceToBlockingTree(heights, row, col, -1, 0) > 0 ||
    distanceToBlockingTree(heights, row, col, 1, 0) > 0 ||
    distanceToBlockingTree(heights, row, col, 0, -1) > 0 ||
    distanceToBlockingTree(heights, row, col, 0, 1) > 0;

  return visible ? 1 : 0;
};

const scenicScore = (heights, row, col) => {
  return (
    Math.abs(distanceToBlockingTree(heights, row, col, -1, 0)) *
    Math.abs(distanceToBlockingTree(heights, row, col, 1, 0)) *
    Math.abs(distanceToBlockingTree(heights, row, col, 0, -1)) *
    Math.abs(distanceToBlockingTree(heights, row, col, 0, 1))
  );
};

const data = await fs.readFile("./8.in", "utf8");

// Part 1
console.log(
  data.split("---\n").map((group) => {
    const lines = group.trim().split("\n");
    const heights = lines.map((line) => line.split("").map(Number));
    return sum(heights.flatMap((row, rowIndex) => row.map((_, colIndex) => visible(heights, rowIndex, colIndex))));
  })
);

// Part 2
console.log(
  data.split("---\n").map((group) => {
    const lines = group.trim().split("\n");
    const heights = lines.map((line) => line.split("").map(Number));
    return max(heights.flatMap((row, rowIndex) => row.map((_, colIndex) => scenicScore(heights, rowIndex, colIndex))));
  })
);
