import { chunk, isEqual } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./22.in", "utf8");

const mod = (v, n) => (v < 0 ? (v % n) + n : v % n);

// Indexes map to deltas to move in the direction associated with the index:
//   0 -> right
//   1 -> down
//   2 -> left
//   3 -> up
const DELTAS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

// This computes the array of positions one can walk to at the given x/y, when heading in the given direction, and wrapping
// around the edges as per the `wrapper` function.
const findPositions = (map, x, y, dir, wrapper) => {
  let [deltaX, deltaY] = DELTAS[dir];

  const positions = [];
  const initialX = x;
  const initialY = y;
  do {
    if (map[y][x] == ".") {
      positions.push([x, y]);
    } else if (map[y][x] == "#") {
      return { positions, blocked: true };
    }

    [x, y, deltaX, deltaY] = wrapper(x, y, deltaX, deltaY);
  } while (x != initialX || y != initialY);

  return { positions, blocked: false };
};

const regularWrappingPositions = (map) => {
  return (x, y, deltaX, deltaY) => {
    if (deltaX == 0) {
      return [x, mod(y + deltaY, map.length), deltaX, deltaY];
    } else {
      return [mod(x + deltaX, map[y].length), y, deltaX, deltaY];
    }
  };
};

// Faces are indexed as follows:
//
const cubeWrappingPositions = (map) => {
  const faceSize = map.length / (map.length > map[0].length ? 4 : 3);
  const smallMap = chunk(map, faceSize).map((row) =>
    chunk(row[0], faceSize).map((clump) => (clump[0] == " " ? " " : "."))
  );

  /**
   * Various transformations. The max value acts as (like?) an offset.
   *
   * @type {((x: number, y: number, max?: number) => [number, number])[]}
   */
  const transformations = [
    // Rotations (computed using a 2d rotation matrix with 0, 90, 180, and 270° angles.)
    (x, y, max = 0) => [x, y], // no rotation
    (x, y, max = 0) => [max - y, x],
    (x, y, max = 0) => [max - x, max - y],
    (x, y, max = 0) => [y, max - x],

    // Reflections (x-axis, y-axis)
    (x, y, max = 0) => [x, max - y],
    (x, y, max = 0) => [max - x, y],
  ];

  //  ..
  //   .
  //   .
  //   ..

  /**
   * When going from face a to b, choose the given rotations index.
   *
   * Note that there could be other unwrappings besides the examples in the comments below, but for the
   * purpose this array serves, the rotation will still be the same.
   *
   * We also don't do all of the various rotations, as we can rotate our state to find a match, and then
   * reverse the result after we're done to get back to where we were. Put another way, we can do a
   * transformation to take us from reality into the coordinate system these wrappings are defined by,
   * and then use the inverse of that transformation to bring us back to reality.
   *
   * We could probably compute this from a breadth-first search, tracking which direction we traveled
   * to move from one face to the next, and composing those rotations when
   *
   * @type {[[number, number], (x: number, y: number, max?: number) => [number, number]][]}
   */
  const wrappings = [
    //    xx
    //    xx
    // aa xx xx bb
    // aa xx xx bb
    //    xx
    //    xx
    [[-3, 0], transformations[5]], // reflection

    // The rest of these are easy to visualize if you imagine the b face bending down, and looking from
    // above, each time it wraps towards face a it will rotate.

    // bb
    // bb
    // xx aa xx xx
    // xx aa xx xx
    //    xx
    //    xx
    [[-1, -1], transformations[1]],

    // bb
    // bb
    // xx xx aa xx
    // xx xx aa xx
    //    xx
    //    xx
    [[-2, -1], transformations[2]],

    // bb
    // bb
    // xx xx xx aa
    // xx xx xx aa
    //    xx
    //    xx
    [[-3, -1], transformations[3]],
  ];

  return (x, y, deltaX, deltaY) => {
    let newX = x + deltaX;
    let newY = y + deltaY;
    if ((map[newY]?.[newX] ?? " ") != " ") {
      return [newX, newY, deltaX, deltaY];
    }

    // Find the transforms that makes it so our current direction is going up (i.e., deltaX = 0, deltaY = 0)
    const transforms = transformations.filter((rotation) => isEqual(rotation(deltaX, deltaY), [0, -1]));
    deltaX = 0;
    deltaY = -1;

    // TODO this could be precomputed for all smallX / smallY
    for (const transform of transforms) {
      // Face-relative coordinates
      const [smallX, smallY] = transform(Math.floor(x / faceSize), Math.floor(y / faceSize));
      const [faceX, faceY] = transform(x - smallX * faceSize, y - smallY * faceSize);

      for (let [[wrapX, wrapY], rotation] of wrappings) {
        const [checkX, checkY] = transform(wrapX, wrapY);
        if (smallMap[checkY + wrapY]?.[checkX + wrapX] != ".") {
          continue;
        }

        // We need to use the face-relative coordinates for rotation. After rotation, we go from the
        // face-relative coordinates (in the new face) to real coordinates.
        [newX, newY] = rotation(faceX, faceY, faceSize - 1);
        newX += checkX * faceSize;
        newY += checkY * faceSize;

        console.log(
          chunk(
            [
              wrapX,
              wrapY,
              x,
              y,
              faceX,
              faceY,
              deltaX,
              deltaY,
              checkX,
              checkY,
              newX,
              newY,
              ...rotation(deltaX, deltaY),
            ].map((v) => String(v).padStart(2, " ")),
            2
          ).join("  ")
        );

        return [newX, newY, ...rotation(deltaX, deltaY)];
      }
    }

    console.log();
    throw new Error("should never get here");
  };
};

const processMap = (map, wrapper) => {
  // newMap[y][x] = [positions reachable moving... right, down, left, up]
  const newMap = map.map((row) => new Array(row.length));
  for (let y = 0; y < map.length; ++y) {
    const row = map[y];
    for (let x = 0; x < row.length; ++x) {
      const v = row[x];
      switch (v) {
        case " ":
        case "#":
          break;
        case ".": {
          newMap[y][x] = [
            findPositions(map, x, y, 0, wrapper),
            findPositions(map, x, y, 1, wrapper),
            findPositions(map, x, y, 2, wrapper),
            findPositions(map, x, y, 3, wrapper),
          ];
        }
      }
    }
  }

  return newMap;
};

/** @return {[string[][], string]} */
const read = (group) => {
  let [map, directions] = group.split("\n\n");
  return [map.split("\n"), directions];
};

const DIRECTIONS_REGEX = /(\d+)([RL])?/g;

const simulate = (map, directions) => {
  let direction = 0;
  let x = map[0].findIndex((v) => v != undefined);
  let y = 0;
  for (let [amount, turn] of directions) {
    const cell = map[y][x];
    const { positions, blocked } = cell[direction];
    if (blocked) {
      amount = Math.min(amount, positions.length - 1);
    } else {
      amount = mod(amount, positions.length);
    }

    [x, y] = positions[amount];
    if (turn) direction = mod(direction + (turn == "R" ? 1 : -1), 4);
  }

  return direction + (x + 1) * 4 + (y + 1) * 1000;
};

// Part 1
// data
//   .split("\n---\n")
//   .map((group) => {
//     const [map, directions] = read(group);
//     const steps = Array.from(directions.matchAll(DIRECTIONS_REGEX)).map((v) => [Number(v[1]), v[2]]);
//     return simulate(processMap(map, regularWrappingPositions(map)), steps);
//   })
//   .forEach((v) => console.log(v));

// Part 2
//
// I didn't want to figure out a generic "figure out the cube unwrapping" function, so I just found the relevant
// indexes and encoded them in the input.
//
// data
//   .split("\n---\n")
//   .map((group, index) => {
//     const [map, directions] = read(group);
//     const steps = Array.from(directions.matchAll(DIRECTIONS_REGEX)).map((v) => [Number(v[1]), v[2]]);
//     return simulate(processMap(map, cubeWrappingPositions(map)), steps);
//   })
//   .forEach((v) => console.log(v));

data
  .split("\n---\n")
  .map((group, index) => {
    if (index != 0) return "";
    const [map, directions] = read(group);
    findPositions(map, 2, 5, 3, cubeWrappingPositions(map));
  })
  .forEach((v) => console.log(v));
