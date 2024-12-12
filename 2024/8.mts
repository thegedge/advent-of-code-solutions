import { combinations } from "../utils/collections.mts";
import { withinBounds } from "../utils/maps.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");
const readData = (data: string) => {
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

const countAntinodes = ({ positions, mapData }: ReturnType<typeof readData>, iterations: number, countNodes = false) => {
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
      for (let iteration = 0; iteration < iterations && withinBounds(mapData, possibleAntinodeRow, possibleAntinodeCol); iteration++) {
        antiNodes.add(`${possibleAntinodeRow},${possibleAntinodeCol}`);
        possibleAntinodeRow -= rowDelta;
        possibleAntinodeCol -= colDelta;
      }

      possibleAntinodeRow = row2 + rowDelta;
      possibleAntinodeCol = col2 + colDelta;
      for (let iteration = 0; iteration < iterations && withinBounds(mapData, possibleAntinodeRow, possibleAntinodeCol); iteration++) {
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

const solvePart1 = () => {
  const results = groups.map(readData).map((data) => {
    return countAntinodes(data, 1);
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((data) => {
    return countAntinodes(data, Number.POSITIVE_INFINITY, true);
  });

  console.log(results);
};

solvePart1();
solvePart2();
