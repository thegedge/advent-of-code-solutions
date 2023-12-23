import { sum } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./18.in", "utf8");

const sides = (cube) => {
  return [
    ["x", cube[0], cube[1], cube[2]],
    ["x", cube[0] + 1, cube[1], cube[2]],
    ["y", cube[0], cube[1], cube[2]],
    ["y", cube[0], cube[1] + 1, cube[2]],
    ["z", cube[0], cube[1], cube[2]],
    ["z", cube[0], cube[1], cube[2] + 1],
  ];
};

const update = (data, cube) => {
  for (const [axis, x, y, z] of sides(cube)) {
    const cubeKey = key(x, y, z);
    const sideKey = `${axis},${cubeKey}`;
    data[sideKey] = sideKey in data ? 0 : 1;
  }
};

const key = (x, y, z) => `${x},${y},${z}`;

const isFree = (cubes, x, y, z) => {
  const cubeKey = key(x, y, z);
  return !(cubeKey in cubes);
};

const bfsDirections = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

/** @return {[boolean, number[][]]} */
const bfs = (cubes, cube, minX, maxX, minY, maxY, minZ, maxZ) => {
  let isExterior = false;
  const visited = [];
  const toVisit = [cube];
  while (toVisit.length > 0) {
    const cube = toVisit.pop();
    visited.push(cube);
    cubes[key.apply(undefined, cube)] = 1;

    for (const direction of bfsDirections) {
      const x = cube[0] + direction[0];
      const y = cube[1] + direction[1];
      const z = cube[2] + direction[2];
      if (isFree(cubes, x, y, z)) {
        if (x <= minX || x >= maxX || y <= minY || y >= maxY || z <= minZ || z >= maxZ) {
          isExterior = true;
        } else {
          toVisit.push([x, y, z]);
        }
      }
    }
  }

  return [isExterior, visited];
};

// Part 1
data
  .split("\n---\n")
  .map((group, index) => {
    // The idea here is to give each side a unique key. If that key is already in our map, flag it as hidden.
    // To simplify our count at the end, we use 0 to mean "hidden" and 1 to mean "exposed"
    const data = {};
    for (const cubeKey of group.split("\n")) {
      const cube = cubeKey.split(",").map(Number);
      update(data, cube);
    }

    return sum(Object.values(data));
  })
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n---\n")
  .map((group, index) => {
    // First we want to collect data similar to part 1 above, but we'll also keep track of the cubes and the min/max
    // extents of every cube, to keep track of the cube that contains all cubes.
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    const cubes = {};
    const data = {};

    for (const cubeKey of group.split("\n")) {
      const cube = cubeKey.split(",").map(Number);
      cubes[cubeKey] = 0;
      minX = Math.min(minX, cube[0]);
      minY = Math.min(minY, cube[1]);
      minZ = Math.min(minZ, cube[2]);
      maxX = Math.max(maxX, cube[0]);
      maxY = Math.max(maxY, cube[1]);
      maxZ = Math.max(maxZ, cube[2]);
      update(data, cube);
    }

    // On our second pass, we want to find all spaces that aren't filled by a lava droplet and classify them as either
    // interior or exterior. We achieve this by doing a breadth-first search (BFS). If the BFS is able to reach the
    // outside "wall" of the space, it's an exterior cube.
    //
    // For all of the interior cubes we find, we set the respective keys for the sides of that interior cube to 0.
    //
    for (let x = minX; x <= maxX; ++x) {
      for (let y = minY; y <= maxY; ++y) {
        for (let z = minZ; z <= maxZ; ++z) {
          if (key(x, y, z) in cubes) {
            continue;
          }

          const [isExterior, found] = bfs(cubes, [x, y, z], minX, maxX, minY, maxY, minZ, maxZ);
          if (!isExterior) {
            for (const cube of found) {
              update(data, cube);
            }
          }
        }
      }
    }

    return sum(Object.values(data));
  })
  // .map((group) => new Simulator(group).run(1_000_000_000_000))
  .forEach((v) => console.log(v));
