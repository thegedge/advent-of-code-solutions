import { inRange, max, min, range } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./14.in", "utf8");

class Line {
  constructor(x1, y1, x2, y2) {
    // Ensure x1/y1 are the smaller coordinates. The min/max approach works below because we only have horizontal and
    // vertical lines, otherwise, we'd potentially mix up the coordinate pairs.
    this.x1 = Math.min(x1, x2);
    this.y1 = Math.min(y1, y2);
    this.x2 = Math.max(x1, x2);
    this.y2 = Math.max(y1, y2);
  }

  fallPoint(x, y) {
    if (y < this.y1 && inRange(x, this.x1, this.x2 + 1)) {
      return this.y1 - 1;
    }
  }

  contains(x, y) {
    // This works because either x1 == x2 or y1 == y2
    return inRange(x, this.x1, this.x2 + 1) && inRange(y, this.y1, this.y2 + 1);
  }

  dumpChar(x, y) {
    return "#";
  }
}

class ObstructionMap {
  map = {};

  fallPoint(x, y) {
    if (x in this.map) {
      const nearest = min(Object.keys(this.map[x]).map((v) => (y < v ? +v : Number.POSITIVE_INFINITY)));
      if (Number.isFinite(nearest)) {
        return nearest - 1;
      }
    }
  }

  contains(x, y) {
    return this.map[x]?.[y] != undefined;
  }

  set(x, y, dumpChar = "•") {
    this.map[x] ??= {};
    this.map[x][y] = dumpChar;
  }

  dumpChar(x, y) {
    return this.map[x][y];
  }
}

const readRocks = (group) => {
  return group.split("\n").flatMap((line) => {
    const points = line.split(" -> ").map((v) => v.split(",").map(Number));
    return range(1, points.length).map((i) => new Line(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1]));
  });
};

const fall = (obstructions, x, y) => min(obstructions.map((o) => o.fallPoint(x, y)).filter((y) => y !== undefined));

// `Array#some` likely lends itself to this being super slow, and some kind of look-up table would perform MUCH better
const simulate = (obstructions) => {
  let x = 500;
  let y = 0;
  if (obstructions[0].contains(x, y)) {
    return false;
  }

  while (true) {
    y = fall(obstructions, x, y);
    if (y == undefined) {
      // Falling into the abyssssssss
      break;
    }

    const goLeft = !obstructions.some((o) => o.contains(x - 1, y + 1));
    if (goLeft) {
      x -= 1;
      y += 1;
      continue;
    }

    const goRight = !obstructions.some((o) => o.contains(x + 1, y + 1));
    if (goRight) {
      x += 1;
      y += 1;
      continue;
    }

    // Didn't fall, go left, or right. We're at rest!
    break;
  }

  if (y !== undefined) {
    obstructions[0].set(x, y);
    return true;
  }

  return false;
};

const dump = (obstructions, x1, y1, x2, y2) => {
  let s = "";
  for (let y = y1; y <= y2; ++y) {
    for (let x = x1; x <= x2; ++x) {
      if (x == 500 && y == 0) {
        s += "+";
        continue;
      }

      const o = obstructions.find((o) => o.contains(x, y));
      if (o) {
        s += o.dumpChar(x, y);
      } else {
        s += " ";
      }
    }
    s += "\n";
  }
  console.log(s);
};

// Part 1
console.log(
  data.split("\n---\n").map((scenario) => {
    const rocks = readRocks(scenario);
    const obstructions = [new ObstructionMap(), ...rocks];

    let grains = 0;
    while (simulate(obstructions)) {
      grains += 1;
    }

    return grains;
  })
);

// Part 2
console.log(
  data.split("\n---\n").map((scenario) => {
    const rocks = readRocks(scenario);

    // Since the simulation is much larger in Part 2, use an obstruction map for the rocks too
    const map = new ObstructionMap();
    for (const rock of rocks) {
      const dx = Math.sign(rock.x2 - rock.x1);
      const dy = Math.sign(rock.y2 - rock.y1);
      let x = rock.x1;
      let y = rock.y1;
      while (x <= rock.x2 && y <= rock.y2) {
        map.set(x, y, "#");
        x += dx;
        y += dy;
      }
    }
    const obstructions = [];
    obstructions.push(map);

    const floorY = 2 + max(rocks.map((v) => v.y2));
    obstructions.push(new Line(Number.NEGATIVE_INFINITY, floorY, Number.POSITIVE_INFINITY, floorY));

    let grains = 0;
    while (simulate(obstructions)) {
      grains += 1;
    }

    return grains;
  })
);
