import { sumOf } from "std/collections/sum_of.ts";
import { bfs, dfs, findAllCoords, Map, validCoords } from "../utils/maps.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const readData = (trail: string): Map<number | null> => {
  const data = trail.split("\n").map((line) => {
    return line.split("").map((char) => char == "." ? null : Number(char));
  });

  return {
    data,
    neighbours(map, row, col) {
      const value = map.data[row][col];
      return validCoords(map, [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ]).filter(([row, col]) => value === null ? false : map.data[row][col] == value + 1);
    },
  };
};

const solvePart1 = () => {
  const results = groups.map(readData).map((map) => {
    return sumOf(findAllCoords(map, 0), (trailhead) => {
      let peaksReached = 0;
      bfs(map, {
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
  const results = groups.map(readData).map((map) => {
    const startingCoords = Array.from(findAllCoords(map, 0));
    const processed = dfs(map, {
      process(map, row, col, _distance, processed: (number | null)[][]) {
        if (map.data[row][col] === 9) {
          return 1;
        }

        // From all of our neighbours, the processed array determines how many distinct paths there
        // were to 9 from that neighbour. Summing all of these values gives us the total number of
        // paths to 9 from the current cell.
        const next = validCoords(map, map.neighbours(map, row, col));
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
