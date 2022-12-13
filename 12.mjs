import { compact, inRange, min } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./12.in", "utf8");

const littleA = "a".charCodeAt(0);
const height = (ch) => ch.charCodeAt(0) - littleA + 1;

const readMap = (data) => {
  let start, end;
  const map = data.split("\n").map((line, row) => {
    return line.split("").map((ch, col) => {
      switch (ch) {
        case "S": {
          start = [row, col];
          return height("a");
        }
        case "E": {
          end = [row, col];
          return height("z");
        }
        default: {
          return height(ch);
        }
      }
    });
  });

  return { map, start, end };
};

const offsets = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const solve = ({ map, start, end }) => {
  // breadth-first search backwards from end point
  let distance = 0;
  const toVisit = [end];
  while (toVisit.length > 0) {
    const visit = toVisit.splice(0, toVisit.length);
    for (const [visitRow, visitCol] of visit) {
      const currentHeight = map[visitRow][visitCol];
      if (currentHeight <= 0) {
        continue;
      }

      map[visitRow][visitCol] = -distance; // negative values determine if visited (negative min distance from end)

      for (const [dr, dc] of offsets) {
        const row = visitRow + dr;
        const col = visitCol + dc;
        if (inRange(row, 0, map.length) && inRange(col, 0, map[0].length)) {
          const height = map[row][col];
          if (height > 0 && currentHeight <= height + 1) {
            toVisit.push([row, col]);
          }
        }
      }
    }

    distance += 1;
  }
};

// Part 1
console.log(
  data.split("\n---\n").map((scenario) => {
    const data = readMap(scenario);
    solve(data);
    return -data.map[data.start[0]][data.start[1]];
  })
);

// Part 2
console.log(
  data.split("\n---\n").map((scenario) => {
    const data = readMap(scenario);
    const potentialStarts = data.map.flatMap((row, rowIndex) =>
      compact(row.map((height, colIndex) => (height == 1 ? [rowIndex, colIndex] : undefined)))
    );
    solve(data);
    return min(
      potentialStarts.map(([row, col]) => (data.map[row][col] < 0 ? -data.map[row][col] : Number.POSITIVE_INFINITY))
    );
  })
);
