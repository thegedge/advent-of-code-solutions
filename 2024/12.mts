import { transpose } from "../utils/collections.mts";
import { bfs, cardinalDirections, type Coordinate, GridMap } from "../utils/maps.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const readData = (data: string) => {
  return new Garden(data.split("\n").map((line) => line.split("")));
};

class Garden extends GridMap<string | null> {
  override neighbours([row, col]: Coordinate): Coordinate[] {
    const currentValue = this.data[row][col];

    return cardinalDirections([row, col]).filter((coord) => this.withinBounds(coord)).filter(([row, col]) => {
      const value = this.data[row][col];
      return currentValue === value;
    });
  }
}

const floodFillPerimeter = (garden: Garden, coord: Coordinate) => {
  let area = 0;
  let perimeter = 0;
  const visited = bfs(garden, {
    startingNodes: [coord],
    process: (map, node) => {
      area += 1;
      perimeter += 4 - map.neighbours(node).length;
      return true;
    },
  });

  // Null out the plot that we just found so a future `floodFill` call won't include it
  visited.forEach((_distance, key) => {
    const [row, col] = garden.nodeFor(key);
    garden.data[row][col] = null;
  });

  return { area, perimeter };
};
//
// We do this by counting the "crossings", that is, when moving from left to right we pass from outside the plot
// into the plot, or vice versa. That means we've crossed a vertical side.
//
// We need to take care to consider the fact that when we move from one row to the next, we may have previously
// counted a shared side. We do this by
const countDistinctVerticalSides = (processed: boolean[][]) => {
  let sides = 0;

  // Add false everywhere so we can cross any plots that are at either edge
  const processedWithExtraColumns = processed.map((row) => [false, ...row, false]);

  // If `true`, we made the same horizontal crossing in the same column of the row above.
  // In other words, the side is shared
  const crossedInPreviousRow = processedWithExtraColumns[0].map(() => false);

  for (let row = 0; row < processedWithExtraColumns.length; row++) {
    let previousValue = false;
    for (let col = 0; col < processedWithExtraColumns[row].length; col++) {
      const currentValue = processedWithExtraColumns[row][col];
      if (currentValue === previousValue) {
        crossedInPreviousRow[col] = false;
      } else {
        // We've crossed a vertical side. Is it a new one?
        if (!crossedInPreviousRow[col]) {
          sides += 1;
        } else if (row > 0 && processedWithExtraColumns[row - 1][col] !== currentValue) {
          // We've crossed a side, but in a different way than the previous row, so it's still a side.
          // For example, this typically happens with holes:
          //
          //    1 2 3 4
          //
          // 1  A A A A
          // 2  A A B A
          // 3  A B A A
          // 4  A A A A
          //
          // Row 2, there's a cross from column 2 to 3
          // Row 3, there's also a crossing from column 2 to 3, but it's not a shared side
          sides += 1;
        }

        crossedInPreviousRow[col] = true;
      }

      previousValue = currentValue;
    }
  }

  return sides;
};

const floodFillSides = (garden: Garden, coord: Coordinate) => {
  let area = 0;
  const visited = bfs(garden, {
    startingNodes: [coord],
    process: (_garden, _row, _col) => {
      area += 1;
      return true;
    },
  });

  const processed = garden.data.map((row) => row.map((_) => false));

  // Null out the plot that we just found so a future `floodFill` call won't include it
  visited.forEach((_distance, key) => {
    const [row, col] = garden.nodeFor(key);
    garden.data[row][col] = null;
    processed[row][col] = true;
  });

  // Count the sides for the plot.
  //
  // See `countDistinctVerticalSides` for more information on how we count distinct vertical sides for a plot found
  // by the flood fill algorithm. We also need to count the horizontal sides too, but instead of writing a completely
  // new function just for that, we can just transpose the plot and now horizontal sides becomes vertical ones!
  const sides = countDistinctVerticalSides(processed) + countDistinctVerticalSides(transpose(processed));

  return { area, sides };
};

const solvePart1 = () => {
  const results = groups.map(readData).map((garden) => {
    let sum = 0;
    garden.forEach((value, coord) => {
      if (value == null) {
        return;
      }

      const { area, perimeter } = floodFillPerimeter(garden, coord);

      sum += coord ? area * perimeter : 0;
    });
    return sum;
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((garden) => {
    let sum = 0;
    garden.forEach((value, coord) => {
      if (value == null) {
        return;
      }

      const { area, sides } = floodFillSides(garden, coord);

      sum += coord ? area * sides : 0;
    });
    return sum;
  });

  console.log(results);
};

solvePart1();
solvePart2();
