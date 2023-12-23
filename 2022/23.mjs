import fs from "node:fs/promises";

const data = await fs.readFile("./23.in", "utf8");

const deltas = [
  [-1, -1],
  [+0, -1],
  [+1, -1],
  [-1, +0],
  [+1, +0],
  [-1, +1],
  [+0, +1],
  [+1, +1],
];

const checks = [
  [
    [-1, -1],
    [+0, -1],
    [+1, -1],
  ],
  [
    [-1, +1],
    [+0, +1],
    [+1, +1],
  ],
  [
    [-1, -1],
    [-1, +0],
    [-1, +1],
  ],
  [
    [+1, -1],
    [+1, +0],
    [+1, +1],
  ],
];

const key = (x, y) => `${x},${y}`;
const occupied = (elves, x, y) => key(x, y) in elves;
const readMap = (group) => group.split("\n").map((row) => row.split(""));
const findElves = (map) =>
  Object.fromEntries(map.flatMap((row, y) => row.flatMap((v, x) => (v == "#" ? [[key(x, y), [x, y]]] : []))));

const desiredPositions = (elves, round) => {
  return Object.values(elves).map((pos) => {
    const allEmpty = deltas.every((delta) => !occupied(elves, pos[0] + delta[0], pos[1] + delta[1]));
    if (allEmpty) {
      return undefined;
    }

    for (let index = 0; index < checks.length; ++index) {
      const check = checks[(index + round) % checks.length];
      const available = check.every(([dx, dy]) => !occupied(elves, pos[0] + dx, pos[1] + dy));
      if (available) {
        return [pos, [pos[0] + check[1][0], pos[1] + check[1][1]]];
      }
    }

    return undefined;
  });
};

const makeMoves = (elves, newPositions) => {
  const dupes = {};
  newPositions.forEach((positions, index) => {
    if (positions == undefined) {
      return;
    }

    const np = positions[1];
    const k = key(np[0], np[1]);
    const v = dupes[k];
    switch (v) {
      case undefined:
        dupes[k] = index;
        break;
      case false:
        newPositions[index] = undefined;
        break;
      default:
        dupes[k] = false;
        newPositions[index] = undefined;
        newPositions[v] = undefined;
        break;
    }
  });

  let anyMoved = false;
  for (const positions of newPositions) {
    if (positions !== undefined) {
      const [op, np] = positions;
      delete elves[key(op[0], op[1])];
      elves[key(np[0], np[1])] = np;
      anyMoved = true;
    }
  }

  return anyMoved;
};

const countEmpty = (elves) => {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let numElves = 0;
  Object.values(elves).forEach(([x, y]) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + 1);
    maxY = Math.max(maxY, y + 1);
    ++numElves;
  });

  return (maxX - minX) * (maxY - minY) - numElves;
};

const simulate = (elves, rounds) => {
  for (let round = 0; round < rounds; ++round) {
    process.env.DUMP_MAP && countEmpty(elves);
    const positions = desiredPositions(elves, round);
    const anyMoved = makeMoves(elves, positions);
    if (!anyMoved) {
      return round + 1;
    }
  }
};

// Part 1
data
  .split("\n---\n")
  .map((group) => {
    const map = readMap(group);
    const elves = findElves(map);
    simulate(elves, 10);
    return countEmpty(elves);
  })
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n---\n")
  .map((group) => {
    const map = readMap(group);
    const elves = findElves(map);
    return simulate(elves, Number.POSITIVE_INFINITY);
  })
  .forEach((v) => console.log(v));
