import { mapValues, range } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./15.in", "utf8");

const regex = /Sensor at x=(?<sx>-?\d+), y=(?<sy>-?\d+): closest beacon is at x=(?<bx>-?\d+), y=(?<by>-?\d+)/;
const parseLine = (line) => {
  const { sx, sy, bx, by } = mapValues(regex.exec(line).groups, Number);
  return [sx, sy, l1(sx, sy, bx, by)];
};

class Range {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }

  inRange(x) {
    return x >= this.l && x <= this.r;
  }
}

// l1 norm, a.k.a. Manhattan distance or taxicab distance
const l1 = (x1, y1, x2, y2) => Math.abs(x2 - x1) + Math.abs(y2 - y1);

const numNoBeaconPositions = (sensorsAndBeacons, row) => {
  const positions = new Set();
  for (const [sx, sy, beaconDist] of sensorsAndBeacons) {
    // If the row we're interested in is within that distance (same x as sensor), we'll track the x coordinates that can't have a beacon
    const deltaY = Math.abs(row - sy);
    if (deltaY <= beaconDist) {
      const deltaX = beaconDist - deltaY;
      for (let x = sx - deltaX; x <= sx + deltaX; ++x) {
        positions.add(x);
      }
    }
  }
  return positions.size;
};

const beaconPosition = (sensorsAndBeacons, size) => {
  for (const row of range(size)) {
    const ranges = [];
    for (const [sx, sy, beaconDist] of sensorsAndBeacons) {
      const deltaY = Math.abs(row - sy);
      if (deltaY <= beaconDist) {
        const deltaX = beaconDist - deltaY;
        ranges.push(new Range(sx - deltaX, sx + deltaX));
      }
    }

    // An optimized way to find an available location on a row: on each iteration find the sensor we're within range of. If we didn't find
    // such a sensor, we're in an available position. Otherwise, we move to one more than the end of its range, and keep going. If we reach
    // the end, there were no available slots.
    let x = 0;
    while (x < size) {
      const range = ranges.find((v) => v.inRange(x));
      if (!range) {
        return [x, row];
      }
      x = range.r + 1;
    }
  }

  return [0, -1];
};

// Part 1
console.log(
  data.split("\n---\n").map((scenario, index) => {
    const sensorsAndBeacons = scenario.split("\n").map(parseLine);
    return numNoBeaconPositions(sensorsAndBeacons, index == 0 ? 10 : 2_000_000);
  })
);

// Part 2
console.log(
  data.split("\n---\n").map((scenario, index) => {
    const sensorsAndBeacons = scenario.split("\n").map(parseLine);
    const [x, y] = beaconPosition(sensorsAndBeacons, index == 0 ? 20 : 4_000_000);
    return 4_000_000 * x + y;
  })
);
