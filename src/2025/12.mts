import { sumOf } from "../utils/collections.mts";
import { GridShape } from "../utils/math/GridShape.mts";

export const inputMapper = (input: string) => {
  const sections = input.split("\n\n");
  const areasString = sections.pop()!;

  const gifts = sections.map((section, index) => {
    const firstNewLine = section.indexOf("\n");
    return GridShape.fromString(section.slice(firstNewLine + 1));
  });

  const areas = areasString.split("\n").map((line) => {
    const [size, amounts] = line.split(": ");
    return {
      size: size.split("x").map(Number) as [number, number],
      amounts: amounts.split(" ").map(Number),
    };
  });

  return {
    gifts,
    areas,
  };
};

const fit = (grid: GridShape, shapes: GridShape[]): GridShape | null => {
  let myShape = shapes.pop();
  if (!myShape) {
    return grid;
  }

  try {
    for (let rotation = 0; rotation < 4; ++rotation) {
      const rotatedShape = myShape.resized(grid.width, grid.height);
      for (let y = 0; y <= grid.height - 3; ++y) {
        for (let x = 0; x <= grid.width - 3; ++x) {
          const shapeTest = rotatedShape.shifted(x, y);
          if (grid.intersects(shapeTest)) {
            continue;
          }

          const newGrid = grid.union(shapeTest);
          const test = fit(newGrid, shapes);
          if (test) {
            return test;
          }
        }
      }
      myShape = myShape.rotatedClockwise();
    }
  } finally {
    shapes.push(myShape);
  }

  return null;
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input.areas, ({ size: [width, height], amounts }) => {
    // So I was just playing around, curious what happens if we just consider a naive packing
    // where every 3x3 shape takes up a 3x3 chunk of the grid (i.e., no overlap between shapes).
    //
    // Turns out, that's the right answer for the main input... (not for the example though)
    //
    // My `fit` function is way too slow, and I'm too tired to figure out how to optimize things
    // right now, so maybe I'll come back later and think about it some more (probably not)

    // That being said, this DOES act as a legit pruning strategy. If there's not enough area
    // to cover all the gifts, we can just return 0 immediately.
    const totalGifts = sumOf(amounts, (amount) => amount);
    const giftsPerRow = Math.floor(width / 3);
    const maxTriviallyPlacedGifts = giftsPerRow * Math.floor(height / 3);
    if (totalGifts <= maxTriviallyPlacedGifts) {
      // Trivially solvable, no need for a fancy check
      return 1;
    }

    const area = sumOf(amounts, (amount, index) => amount * input.gifts[index].area);
    if (width * height - area < 0) {
      // We have more area in the shapes than what the grid offers, so it's impossible to fit
      return 0;
    }

    // This is too slow...
    //
    // const grid = new GridShape(arrayOf(height, () => arrayOf(width, false)));
    // return fit(
    //   grid,
    //   amounts.flatMap((amount, index) => arrayOf(amount, input.gifts[index]))
    // )
    //   ? 1
    //   : 0;
    throw new Error("cannot solve");
  });
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  // Nothing to solve, there's no part two!
};
