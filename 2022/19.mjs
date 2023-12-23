import { multiply, sum, take } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./19.in", "utf8");

const REGEX =
  /Blueprint (?:\d+): Each ore robot costs (?<oreOre>\d+) ore. Each clay robot costs (?<clayOre>\d+) ore. Each obsidian robot costs (?<obsOre>\d+) ore and (?<obsClay>\d+) clay. Each geode robot costs (?<geodeOre>\d+) ore and (?<geodeObs>\d+) obsidian./;

const howManyCanBeMade = (blueprint, materials, robots) => {
  // Given we call this in `maxGeodes` AFTER materials were added, we need to take away the materials to get the true count
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

class Simulation {
  constructor(blueprints) {
    this.blueprints = blueprints;
    this.materials = [0, 0, 0, 0];
    this.robots = [1, 0, 0, 0];
    this.currentMax = 0;
    this.howManyLastTurn = [0, 0, 0, 0];
    this.builtLast = undefined;

    this.maxAcrossBlueprints = this.blueprints.reduce(
      (maxes, blueprint) => blueprint.map((v, index) => Math.max(v, maxes[index])),
      [0, 0, 0, Number.POSITIVE_INFINITY]
    );
  }

  run(time, countsLastTime = [0, 0, 0, 0], waitedLastTime = false) {
    if (time == 0) {
      this.currentMax = Math.max(this.currentMax, this.materials[3]);
      return this.currentMax;
    }

    // Suppose we could make a geode bot every minute from now on, how many geodes could be made? If that's less than the
    // current max value, no need to go further. Hence the above condition.
    if (this.materials[3] + (time + 1) * this.robots[3] + time * (time - 1) * 0.5 < this.currentMax) {
      return this.currentMax;
    }

    add(this.materials, this.robots);
    try {
      const counts = this.blueprints.map((blueprint) => howManyCanBeMade(blueprint, this.materials, this.robots));

      let wait = false;
      this.blueprints.forEach((blueprint, index) => {
        // We've already maxed out on this robot, don't make more
        if (this.materials[index] + time * this.robots[index] > this.maxAcrossBlueprints[index] * time) {
          return;
        }

        // If we could have created this robot last turn but did not do so, ignore this branch (prunes real good!)
        if (waitedLastTime && countsLastTime[index] > 0) {
          return;
        }

        // Can't make now, but if the robots exist to produce resources to make me, we should wait
        if (counts[index] == 0) {
          wait ||= blueprint.every((v, index) => v == 0 || this.robots[index] > 0);
          return;
        }

        // If we could have made one last turn, and didn't, ignore this branch. This can happen when we go down the "wait" path below.
        // That is, unless it's a geode robot, which we always want to make
        // (builtLast == index || builtLast == undefined) &&
        // howManyLastTurn[index] == 0

        add(this.materials, blueprint, -1);
        this.robots[index] += 1;
        this.run(time - 1);
        this.robots[index] -= 1;
        add(this.materials, blueprint, 1);
      });

      // Consider the branch where we decided to not make a robot, but only if it wasn't at all possible to build in this
      // step (because if we can build, we always want to do so)
      if (wait) {
        this.run(time - 1, counts, true);
      }
    } finally {
      add(this.materials, this.robots, -1);
    }

    return this.currentMax;
  }
}

// 1663 too low

// Part 1
data
  .split("\n---\n")
  .map((group) => {
    return sum(
      group.split("\n").map((blueprint, index) => {
        const [oreOre, clayOre, obsOre, obsClay, geodeOre, geodeObs] = REGEX.exec(blueprint).slice(1).map(Number);
        return (
          (index + 1) *
          new Simulation([
            [oreOre, 0, 0, 0],
            [clayOre, 0, 0, 0],
            [obsOre, obsClay, 0, 0],
            [geodeOre, 0, geodeObs, 0],
          ]).run(24)
        );
      })
    );
  })
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n---\n")
  .map((group) => {
    return take(group.split("\n"), 3)
      .map((blueprint, index) => {
        const [oreOre, clayOre, obsOre, obsClay, geodeOre, geodeObs] = REGEX.exec(blueprint).slice(1).map(Number);
        return new Simulation([
          [oreOre, 0, 0, 0],
          [clayOre, 0, 0, 0],
          [obsOre, obsClay, 0, 0],
          [geodeOre, 0, geodeObs, 0],
        ]).run(32);
      })
      .reduce(multiply);
  })
  .forEach((v) => console.log(v));
