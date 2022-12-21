import { sum } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./19.in", "utf8");

const REGEX =
  /Blueprint (?:\d+): Each ore robot costs (?<oreOre>\d+) ore. Each clay robot costs (?<clayOre>\d+) ore. Each obsidian robot costs (?<obsOre>\d+) ore and (?<obsClay>\d+) clay. Each geode robot costs (?<geodeOre>\d+) ore and (?<geodeObs>\d+) obsidian./;

const howManyCanBeMade = (blueprint, materials, robots) => {
  // Given how this is called in `maxGeodes`, we need to take away the materials the robots added in the same turn
  return Math.floor(
    Math.min(
      blueprint[0] == 0 ? Number.POSITIVE_INFINITY : (materials[0] - robots[0]) / blueprint[0],
      blueprint[1] == 0 ? Number.POSITIVE_INFINITY : (materials[1] - robots[1]) / blueprint[1],
      blueprint[2] == 0 ? Number.POSITIVE_INFINITY : (materials[2] - robots[2]) / blueprint[2]
    )
  );
};

const add = (a, b, factor = 1) => {
  a[0] += factor * b[0];
  a[1] += factor * b[1];
  a[2] += factor * b[2];
  a[3] += factor * b[3];
};

let best;

const maxGeodes = (time, blueprints, materials = [0, 0, 0, 0], robots = [1, 0, 0, 0]) => {
  let max = materials[3];
  if (time == 1) {
    // if (!best || max + robots[3] > best[0]) {
    //   add(materials, robots);
    //   best = [max + robots[3], [...materials], [...robots]];
    //   add(materials, robots, -1);
    // }
    return max + robots[3];
  }

  add(materials, robots);

  // Make all the robots we can in one step
  for (let index = blueprints.length - 1; index >= 0; --index) {
    const blueprint = blueprints[index];

    // We should always make a robot if we can. If we've gone down a branch where we can make more than one robot,
    // it's not gonna be the best possible branch, so prune it.
    const count = howManyCanBeMade(blueprint, materials, robots);
    if (count == 1) {
      add(materials, blueprint, -count);
      robots[index] += count;

      // max = Math.max(max, maxGeodes(time, blueprints, materials, robots));
      max = Math.max(max, maxGeodes(time - 1, blueprints, materials, robots));

      robots[index] -= count;
      add(materials, blueprint, count);
      //
      //       if (robots[index] > 0) {
      //         break;
      //       }
    }
  }

  // Consider the branch where we decided to not make a robot, but only if it wasn't at all possible to build in this
  // step (because if we can build, we always want to do so)
  max = Math.max(max, maxGeodes(time - 1, blueprints, materials, robots));

  add(materials, robots, -1);

  // if (time == 24) {
  //   console.log(best);
  // }

  return max;
};

// Part 1
data
  .split("\n---\n")
  .map((group) => {
    return sum(
      group.split("\n").map((blueprint, index) => {
        const [oreOre, clayOre, obsOre, obsClay, geodeOre, geodeObs] = REGEX.exec(blueprint).slice(1).map(Number);
        const value = maxGeodes(24, [
          [oreOre, 0, 0, 0],
          [clayOre, 0, 0, 0],
          [obsOre, obsClay, 0, 0],
          [geodeOre, 0, geodeObs, 0],
        ]);
        return (index + 1) * value;
      })
    );
  })
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n---\n")
  .map((group) => {
    //
  })
  .forEach((v) => console.log(v));
