import { withinBounds } from "../utils/graphs.mts";
import { readInputFile } from "../utils/utility.mts";

const groups = await readInputFile(import.meta);
const readData = (data: string) => {
  let startCol = 0;
  let startRow = 0;

  const map = data.split("\n").map((line, row) => {
    return line.split("").map((char, col): number[] | null => {
      if (char == "^") {
        startCol = col;
        startRow = row;
        return [];
      } else {
        return char == "." ? [] : null;
      }
    });
  });

  return {
    startCol,
    startRow,

    /** `null` if obstructed, otherwise a a list of directions traversed */
    map,
  };
};

const DIRECTIONS = [
  [0, -1], // North
  [1, 0], // East
  [0, 1], // South
  [-1, 0], // West
];

const canMove = (map: unknown[][], row: number, col: number, direction: number) => {
  const [deltaCol, deltaRow] = DIRECTIONS[direction];
  if (!withinBounds(map, [row + deltaRow, col + deltaCol])) {
    // Allow the guard to move off the map
    return true;
  }

  if (map[row + deltaRow][col + deltaCol] === null) {
    return false;
  }

  return true;
};

const solve = ({ startRow, startCol, map }: ReturnType<typeof readData>) => {
  let direction = 0;
  let col = startCol;
  let row = startRow;
  let distinctCount = 0;
  while (withinBounds(map, [row, col])) {
    if (map[row][col]!.includes(direction)) {
      // This is another sentinel condition. If we find ourselves on a map tile that we've already
      // traversed in the same direction, we're in a loop.
      return { distinctCount, looped: true };
    }

    map[row][col]!.push(direction);
    if (map[row][col]!.length == 1) {
      // If we haven't already visited this space, count it
      distinctCount += 1;
    }

    // Turn until we can move again
    while (!canMove(map, row, col, direction)) {
      direction = (direction + 1) % 4;
    }

    const [deltaCol, deltaRow] = DIRECTIONS[direction];
    col += deltaCol;
    row += deltaRow;
  }

  return { distinctCount, looped: false };
};

const solvePart1 = () => {
  const results = groups.map(readData).map((data) => {
    return solve(data).distinctCount;
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map(({ startRow, startCol, map }) => {
    let count = 0;
    for (let row = 0; row < map.length; ++row) {
      for (let col = 0; col < map[row].length; ++col) {
        if ((col != startCol || row != startRow) && map[row][col] !== null) {
          // If we're not at the start position or an existing obstruction, place one.
          // Not the fastest approach, but finishes within a few seconds.
          const mapCopy = map.map((row) => row.map((v) => (v == null ? null : [])));
          mapCopy[row][col] = null;
          count += solve({ startRow, startCol, map: mapCopy }).looped ? 1 : 0;
        }
      }
    }
    return count;
  });

  console.log(results);
};

solvePart1();
solvePart2();
