import { inRange } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./24.in", "utf8");

// We use a bitmask for the directions, to avoid having to manipulate an array (performance!)
const valueFor = (v) => {
  switch (v) {
    case "<":
      return 0x8;
    case ">":
      return 0x4;
    case "^":
      return 0x2;
    case "v":
      return 0x1;
    default:
      return 0;
  }
};

const print = (v) => {
  switch (v) {
    case 0x8:
      return "<";
    case 0x4:
      return ">";
    case 0x2:
      return "^";
    case 0x1:
      return "v";
    case 0:
      return ".";
    default:
      return "+";
  }
};

const mod = (v, n) => (v < 0 ? (v % n) + n : v % n);
const trimEnds = (v) => v.slice(1, -1);

const readMap = (group) => {
  return trimEnds(group.split("\n")).map((row) =>
    trimEnds(row)
      .split("")
      .map((cell) => valueFor(cell))
  );
};

const updateMap = (map) => {
  const w = map[0].length;
  const h = map.length;
  return map.map((row, y) =>
    row.map(
      (_, x) =>
        ((row[mod(x + 1, w)] & 0x8) != 0 ? 0x8 : 0) |
        ((row[mod(x - 1, w)] & 0x4) != 0 ? 0x4 : 0) |
        ((map[mod(y + 1, h)][x] & 0x2) != 0 ? 0x2 : 0) |
        ((map[mod(y - 1, h)][x] & 0x1) != 0 ? 0x1 : 0)
    )
  );
};

const deltas = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const dump = (map) => {
  console.log("#" + "." + "#".repeat(map[0].length));
  console.log(map.map((row) => ["#", ...row.map((v) => print(v)), "#"].join("")).join("\n"));
  console.log("#".repeat(map[0].length) + "." + "#");
};

// This is probably one of the most necessary aspects. To keep our visit list in the search below small, we want to
// de-duplicate any positions. Since [x, y] pairs can only compare the same if the arrays are the exact same instance,
// we instead encode positions as integers.
const encode = (x, y, w) => y * w + x;
const decode = (v, w) => [v % w, Math.floor(v / w)];

const countMoves = (map, from, to, ddump) => {
  const w = map[0].length;
  const h = map.length;

  // breadth-first search
  let positionsToCheck = new Set([from]);
  for (let iter = 1; positionsToCheck.size > 0; ++iter) {
    map = updateMap(map);

    const newPositionsToCheck = positionsToCheck;
    positionsToCheck = new Set();

    if (ddump) dump(map);

    for (const encodedPosition of newPositionsToCheck) {
      const [x, y] = decode(encodedPosition, w);
      for (const [dx, dy] of deltas) {
        const newX = x + dx;
        const newY = y + dy;
        const encoded = encode(newX, newY, w);
        if (encoded == to) {
          return [iter, map];
        }

        if (ddump) console.log(x, y, newX, newY);

        if (inRange(newX, 0, w) && inRange(newY, 0, h) && map[newY][newX] == 0) {
          // map[y][x] == 0 means there's no blizzard at (newX,newY)
          positionsToCheck.add(encoded);
        }
      }

      // We should always allow staying at the current position, if there's no blizzard
      if ((map[y]?.[x] ?? 0) == 0) {
        positionsToCheck.add(encodedPosition);
      }
    }

    if (ddump) console.log();
  }

  throw new Error("uh oh");
};

// Part 1
data
  .split("\n---\n")
  .map((group) => {
    const map = readMap(group);
    const w = map[0].length;
    const h = map.length;
    return countMoves(map, encode(0, -1, w), encode(w - 1, h, w))[0];
  })
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n---\n")
  .map((group) => {
    const map = readMap(group);
    const w = map[0].length;
    const h = map.length;

    const start = encode(0, -1, w);
    const end = encode(w - 1, h, w);

    const [first, mapA] = countMoves(map, start, end);
    const [snack, mapB] = countMoves(mapA, end, start);
    const [again, _] = countMoves(mapB, start, end);
    return first + snack + again;
  })
  .forEach((v) => console.log(v));
