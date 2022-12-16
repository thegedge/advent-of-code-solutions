import { range } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./16.in", "utf8");

const regex = /Valve (?<name>\w+) has flow rate=(?<rate>\d+); tunnels? leads? to valves? (?<tunnels>[A-Z, ]+)/;

const readValves = (scenario) => {
  const entries = [];
  for (const line of scenario.split("\n")) {
    const { name, rate, tunnels } = regex.exec(line).groups;
    const entry = {
      name,
      rate: Number(rate),
      tunnels: tunnels.split(", "),
    };

    // Simplify everything by making "AA" be index 0
    if (name == "AA") {
      entries.unshift(entry);
    } else {
      entries.push(entry);
    }
  }

  const mapping = Object.fromEntries(entries.map(({ name }, index) => [name, index]));
  return entries.map(({ name, rate, tunnels }) => {
    return {
      name,
      rate,
      open: false,
      index: mapping[name],
      tunnels: tunnels.map((dest) => ({ valve: mapping[dest], visited: false })),
    };
  });
};

function* combinations(array, n, from = 0) {
  if (n == 0) {
    yield [];
    return;
  }

  for (let i = from; i <= array.length - n; ++i) {
    const v = array[i];
    for (const c of combinations(array, n - 1, i + 1)) {
      yield [v, ...c];
    }
  }
}

// My first attempt was a naive backtracking solution, but it performed poorly.
//
// To speed up backtracking, you have to find aways to prune various paths through your data. My first pruning
// strategy was to not visit a tunnel that I had already visited, but it was giving me the wrong answer. It was
// not obvious to me if this pruning strategy was even correct.
//
// My second was realizing there's never any point in opening a valve if it produces no flow.
//
// Both of these still didn't help. I considered a `valve.open` check, but we may want to visit an open valve
// again to go through a tunnel to get to another valve. This is likely why I get the wrong answer with this
// solution too.
//
const solve1 = (valves, visit = 0, rate = 0, time = 30) => {
  const valve = valves[visit];
  if (time <= 1) {
    // <= 1 because, even if we open, there will be no time for the flow to go through
    return rate;
  }

  let best = rate;
  for (const tunnel of valve.tunnels) {
    if (tunnel.visited) {
      continue;
    }

    tunnel.visited = true;
    {
      // Don't open current, just travel
      best = Math.max(best, solve1(valves, tunnel.valve, rate, time - 1));

      // If not open, and this valve can produce flow, open and then travel
      if (!valve.open && valve.rate > 0) {
        valve.open = true;
        best = Math.max(best, solve1(valves, tunnel.valve, rate + (time - 1) * valve.rate, time - 2));
        valve.open = false;
      }
    }
    tunnel.visited = false;
  }

  return best;
};

// All pairs shortest path (see https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm)
const floyd_warshall = (valves) => {
  const n = valves.length;
  const dist = new Array(n * n);
  dist.fill(Number.POSITIVE_INFINITY);

  for (const { index, tunnels } of valves) {
    dist[index + n * index] = 0;
    for (const { valve } of tunnels) {
      dist[index + n * valve] = 1;
    }
  }

  for (let k = 0; k < n; ++k) {
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < n; ++j) {
        const newDistance = dist[i + n * k] + dist[k + n * j];
        dist[i + n * j] = Math.min(dist[i + n * j], newDistance);
      }
    }
  }

  for (const valve of valves) {
    valve.distances = new Array(n);
    for (let i = 0; i < n; ++i) {
      valve.distances[i] = dist[valve.index + n * i];
    }
  }
};

// My second approach was observing that a lot of valves have no flow. An observation here is that we'd never open
// these valves, so they only serve as a means to travel to valves that can produce flow.
//
// Given that, we preprocess the valves to get the valves that can produce flow, and the shortest paths to get to
// all of the other valves that have flow. That way we never have to recurse into those valves, and simply jump
// to them and subtract the amount of time it would take us to do so.
//
// Another thing I do now is "for..let index" loops, which are significantly faster than forEach and "for const of"
// loops, and given how much backtracking we're doing, this is a significant and noticeable speed up. This is generally
// not something one should worry about, but this is a REALLY hot loop, so it makes a difference. We also avoid
// the cost of a destructuring assignment in a hot loop.
//
const solve = (valves, time, n) => {
  floyd_warshall(valves);

  const flowValves = valves.filter((v) => v.rate > 0);

  const solve_ = (peeps, rate, available, onlyPeepsAfterIndex = 0) => {
    let best = rate;

    // If we've already opened every flow-y valve, the best we can do is the current rate
    if (available == 0) {
      return best;
    }

    // "for..let index" loops are significantly faster than forEach and "for const of" loops, and given how much backtracking
    // we're doing, this is a significant and noticeable speed up. We also avoid destructuring assignment.
    for (let fi = 0; fi < flowValves.length; ++fi) {
      const flowValve = flowValves[fi];
      if (flowValve.open) {
        continue;
      }

      // An observation I made after some time was that the backtracking solution would do a lot of duplicate branches. This was the
      // last piece that allowed me to have a solution that finished in a reasonable amount of time (16s, still pretty slow).
      //
      // The idea here is that if we always start from index 0, we will have the following recursion (for n=2)
      //
      //   0 visits AA -> 1 visits CC -> 0 visits BB
      //   0 visits AA -> 0 visits BB -> 1 visits CC
      //
      // The result for both of these will be the same. Instead, we heavily prune by only considering all peeps after the index we're
      // currently considering.
      //
      for (let pi = onlyPeepsAfterIndex; pi < peeps.length; ++pi) {
        const peep = peeps[pi];
        const valve = valves[peep[0]];
        const moveAndOpenCost = 1 + valve.distances[flowValve.index];
        if (peep[1] <= moveAndOpenCost) {
          continue;
        }

        valves[flowValve.index].open = true;
        peep[0] = flowValve.index;
        peep[1] -= moveAndOpenCost;

        const newRate = rate + peep[1] * flowValve.rate;

        // Consider the scenario where we move to and open the given valve
        best = Math.max(best, solve_(peeps, newRate, available - 1, pi));

        valves[flowValve.index].open = false;
        peep[0] = valve.index;
        peep[1] += moveAndOpenCost;
      }
    }

    return best;
  };

  const peeps = range(n).map(() => [0, time]);
  return solve_(peeps, 0, flowValves.length);
};

// Part 1
console.log(
  data.split("\n---\n").map((group) => {
    const valves = readValves(group);
    return solve(valves, 30, 1);
  })
);

// Part 2
console.log(
  data.split("\n---\n").map((group) => {
    const valves = readValves(group);
    return solve(valves, 26, 2);
  })
);
