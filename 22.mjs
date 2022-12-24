import { countBy } from "lodash-es";
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
  const positions = [];
  const [deltaX, deltaY] = DELTAS[dir];
  const initialX = x;
  const initialY = y;
  do {
    if (map[y][x] == ".") {
      positions.push([x, y]);
    } else if (map[y][x] == "#") {
      return { positions, blocked: true };
    }

    const pos = wrapper(x, y, deltaX, deltaY);
    x = pos[0];
    y = pos[1];
  } while (x != initialX || y != initialY);

  return { positions, blocked: false };
};

const regularWrappingPositions = (map) => {
  return (x, y, deltaX, deltaY) => {
    if (deltaX == 0) {
      return [x, mod(y + deltaY, map.length)];
    } else {
      return [mod(x + deltaX, map[y].length), y];
    }
  };
};

// Faces are indexed as follows:
// 6 = +x
// 3 = -x
// 4 = +y
// 2 = -y
// 5 = +z
// 1 = -z
//
const cubeWrappingPositions = (faceMap) => {
  const faceSize = Object.values(countBy(faceMap[0].replaceAll(" ", "")))[0];
  const regex = new RegExp(`([ 0-9])\\1*`, "g");
  const smallMap = faceMap.map((row) => row.replaceAll(regex, "$1"));

  // Do a BFS, while also considering the orientation as we move onto new faces. This gives us a rotational value to
  // map the edges together.

  const bfs = (x, y) => {};

  return (x, y, deltaX, deltaY) => {
    let newX = x + deltaX;
    let newY = y + deltaY;
    if (faceMap[y]?.[newX] != " ") {
      return [newX, newY];
    }

    // We went off the map or into an empty space, figure out corresponding edge we're traveling on
    const smallX = Math.floor(x / faceSize);
    const smallY = Math.floor(y / faceSize);
    if (deltaX < 0) {
    } else if (deltaX > 0) {
    } else if (deltaY < 0) {
    } else if (deltaY > 0) {
    }
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

/** @return {[string[][], string[], string]} */
const read = (group) => {
  let [map, faceMap, directions] = group.split("\n\n");
  return [map.split("\n"), faceMap.split("\n"), directions];
};

const regex = /(\d+)([RL])?/g;

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
data
  .split("\n---\n")
  .map((group) => {
    const [map, _, directions] = read(group);
    const steps = Array.from(directions.matchAll(regex)).map((v) => [Number(v[1]), v[2]]);
    return simulate(processMap(map, regularWrappingPositions(map)), steps);
  })
  .forEach((v) => console.log(v));

// Part 2
//
// I didn't want to figure out a generic "figure out the cube unwrapping" function, so I just found the relevant
// indexes and encoded them in the input.
//
data
  .split("\n---\n")
  .map((group, index) => {
    const [map, faceMap, directions] = read(group);
    const steps = Array.from(directions.matchAll(regex)).map((v) => [Number(v[1]), v[2]]);
    return simulate(processMap(map, cubeWrappingPositions(faceMap)), steps);
  })
  .forEach((v) => console.log(v));
