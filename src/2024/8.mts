import { combinations } from "../utils/collections.mts";
import { withinBounds } from "../utils/graphs.mts";

export const inputMapper = (data: string) => {
  // Map from node to location
  const positions: Record<string, [number, number][]> = {};
  const mapData = data.split("\n").map((line, row) => {
    return line.split("").map((ch, col) => {
      if (ch !== ".") {
        positions[ch] ??= [];
        positions[ch].push([row, col]);
        return ch;
      } else {
        return null;
      }
    });
  });
  return { positions, mapData };
};

const countAntinodes = (
  { positions, mapData }: ReturnType<typeof inputMapper>,
  iterations: number,
  countNodes = false
) => {
  const antiNodes = new Set<string>();
  for (const [_node, locations] of Object.entries(positions)) {
    if (countNodes) {
      for (const [row, col] of locations) {
        antiNodes.add(`${row},${col}`);
      }
    }

    for (const [[row1, col1], [row2, col2]] of combinations(locations, 2)) {
      const rowDelta = row2 - row1;
      const colDelta = col2 - col1;

      let possibleAntinodeRow = row1 - rowDelta;
      let possibleAntinodeCol = col1 - colDelta;
      for (
        let iteration = 0;
        iteration < iterations && withinBounds(mapData, [possibleAntinodeRow, possibleAntinodeCol]);
        iteration++
      ) {
        antiNodes.add(`${possibleAntinodeRow},${possibleAntinodeCol}`);
        possibleAntinodeRow -= rowDelta;
        possibleAntinodeCol -= colDelta;
      }

      possibleAntinodeRow = row2 + rowDelta;
      possibleAntinodeCol = col2 + colDelta;
      for (
        let iteration = 0;
        iteration < iterations && withinBounds(mapData, [possibleAntinodeRow, possibleAntinodeCol]);
        iteration++
      ) {
        antiNodes.add(`${possibleAntinodeRow},${possibleAntinodeCol}`);
        possibleAntinodeRow += rowDelta;
        possibleAntinodeCol += colDelta;
      }
    }
  }

  // console.log(
  //   mapData.map((row, y) =>
  //     row.map((cell, x) => {
  //       return antiNodes.has(`${y},${x}`) ? "#" : cell ?? ".";
  //     }).join("")
  //   ).join("\n"),
  // );
  // console.log();

  return antiNodes.size;
};

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  return countAntinodes(data, 1);
};

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
  return countAntinodes(data, Number.POSITIVE_INFINITY, true);
};
