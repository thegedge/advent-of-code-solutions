import { bfs, type Coordinate, Map } from "../utils/maps.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const readData = (data: string) => {
  return new Garden(data.split("\n").map((line) => line.split("")));
};

class Garden extends Map<string | null> {
  neighboursFor([row, col]: Coordinate): Coordinate[] {
    const currentValue = this.data[row][col];

    return ([
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ] as Coordinate[]).filter((coord) => this.withinBounds(coord)).filter(([row, col]) => {
      const value = this.data[row][col];
      return currentValue === value;
    });
  }
}

const floodFill = (garden: Garden, coord: Coordinate) => {
  let area = 0;
  let perimeter = 0;
  const processed = bfs(garden, {
    startingCoords: [coord],
    process: (garden, row, col) => {
      area += 1;
      perimeter += 4 - garden.neighbours([row, col]).length;
      return true;
    },
  });
  return { area, perimeter, processed };
};

const solvePart1 = () => {
  const results = groups.map(readData).map((garden) => {
    let sum = 0;
    garden.forEach((value, coord) => {
      if (value == null) {
        return;
      }

      const { processed, area, perimeter } = floodFill(garden, coord);
      processed.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          if (value) {
            garden.data[rowIndex][colIndex] = null;
          }
        });
      });

      sum += coord ? area * perimeter : 0;
    });
    return sum;
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
