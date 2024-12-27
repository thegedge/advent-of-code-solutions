import { GridMap } from "../utils/maps.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n---\n");

const readData = (data: string) => {
  const [map, movements] = data.split("\n\n");
  return {
    map: new GridMap(map.split("\n").map((row) => row.split(""))),
    movements: movements.split("\n").join("").split("").map((movement): [number, number] => {
      switch (movement) {
        case "^":
          return [0, -1];
        case "v":
          return [0, 1];
        case "<":
          return [-1, 0];
        case ">":
          return [1, 0];
        default:
          // Unreachable, but making TS happy
          return [0, 0];
      }
    }),
  };
};

type RobotMap = GridMap<string>;

const maybeMoveBoxes1 = (map: RobotMap, x: number, y: number, deltaX: number, deltaY: number) => {
  const newX = x + deltaX;
  const newY = y + deltaY;
  if (map.data[newY][newX] == ".") {
    return true;
  }

  if (map.data[newY][newX] == "O") {
    if (maybeMoveBoxes1(map, newX, newY, deltaX, deltaY)) {
      map.data[newY][newX] = ".";
      map.data[newY + deltaY][newX + deltaX] = "O";
      return true;
    }
  }

  // Cell for newX/newY is either "#" or we couldn't push the boxes
  return false;
};

const maybeMoveBoxes2 = (map: RobotMap, x: number, y: number, deltaX: number, deltaY: number) => {
  const newX = x + deltaX;
  const newY = y + deltaY;
  const newValue = map.data[newY][newX];
  if (newValue == ".") {
    return true;
  }

  if (newValue == "#") {
    return false;
  }

  // newValue == "[" || newValue == "]"
  // The coordinates in these arrays is always for the left side of a box
  const boxesToMove = [];
  const boxesToCheck = [[newValue == "[" ? newX : newX - 1, newY]];
  while (boxesToCheck.length > 0) {
    const [boxX, boxY] = boxesToCheck.shift()!;

    const nextX = boxX + 2 * deltaX;
    const nextY = boxY + deltaY;
    const nextValue = map.data[nextY][nextX];
    const nextValueRight = map.data[nextY][nextX + 1];
    // console.log(boxX, boxY, nextValue);

    boxesToMove.push([boxX, boxY]);

    // Just for making it easier to reason about, we'll consider the horizontal cases separately
    if (deltaY == 0) {
      if (deltaX == -1 && nextValueRight == "#") {
        // blocked on the left, we can't move
        return false;
      } else if (deltaX == 1 && nextValue == "#") {
        // blocked on the right, we can't move
        return false;
      } else if (nextValue == "[") {
        boxesToCheck.push([nextX, nextY]);
      } else {
        // empty space in front of the box, nothing to do
      }

      continue;
    }

    if (nextValue == "#" || nextValueRight == "#") {
      // blocked above/below, we can't move
      return false;
    } else if (nextValue == ".") {
      if (nextValueRight == ".") {
        // ...@..
        // ..[]..
        // ......
        // empty space in front of the box, nothing to do
      } else {
        // ...@..
        // ..[]..
        // ...[].
        boxesToCheck.push([nextX + 1, nextY]);
      }
    } else if (nextValueRight == ".") {
      // ...@..
      // ..[]..
      // .[]...
      boxesToCheck.push([nextX - 1, nextY]);
    } else if (nextValue == "[") {
      // ...@..
      // ..[]..
      // ..[]..
      boxesToCheck.push([nextX, nextY]);
    } else {
      // ...@..
      // ..[]..
      // .[][].
      boxesToCheck.push([nextX - 1, nextY]);
      boxesToCheck.push([nextX + 1, nextY]);
    }
  }

  // We can push all of the boxes! Let's sort the boxes from the furthest to the closest and adjust the map data
  boxesToMove.sort(([x1, y1], [x2, y2]) => {
    return -deltaY * (y1 - y2) + -deltaX * (x1 - x2);
  });

  for (const [boxX, boxY] of boxesToMove) {
    map.data[boxY][boxX] = ".";
    map.data[boxY][boxX + 1] = ".";
    map.data[boxY + deltaY][boxX + deltaX] = "[";
    map.data[boxY + deltaY][boxX + deltaX + 1] = "]";
  }

  // Success! Move all the boxes now.
  return true;
};

const solvePart1 = () => {
  const results = groups.map(readData).map(({ map, movements }, index) => {
    let [y, x] = map.findCoords("@")[0];

    for (const [deltaX, deltaY] of movements) {
      if (maybeMoveBoxes1(map, x, y, deltaX, deltaY)) {
        map.data[y][x] = ".";
        x += deltaX;
        y += deltaY;
        map.data[y][x] = "@";
      }
    }

    let sum = 0;
    map.forEach((value, [row, col]) => {
      if (value == "O") {
        sum += 100 * row + col;
      }
    });
    return sum;
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map(({ map, movements }) => {
    map = new GridMap(map.data.map((row) =>
      row.flatMap((v) => {
        if (v == "." || v == "#") {
          return [v, v];
        } else if (v == "O") {
          return ["[", "]"];
        } else {
          return ["@", "."];
        }
      })
    ));
    let [y, x] = map.findCoords("@")[0];

    for (const [deltaX, deltaY] of movements) {
      // console.log(map.dump());
      // console.log(deltaX, deltaY);
      if (maybeMoveBoxes2(map, x, y, deltaX, deltaY)) {
        map.data[y][x] = ".";
        x += deltaX;
        y += deltaY;
        map.data[y][x] = "@";
      }
    }
    // console.log(map.dump());

    let sum = 0;
    map.forEach((value, [row, col]) => {
      if (value == "[") {
        sum += 100 * row + col;
      }
    });
    return sum;
  });

  console.log(results);
};

solvePart1();
solvePart2();
