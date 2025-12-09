import { cartesianProduct } from "../utils/collections.mts";
import { lcm } from "../utils/math/index.mts";

export const inputMapper = (data: string) => {
  const [steps, ...nodes] = data.split("\n");
  return {
    steps: steps.split("") as ("L" | "R")[],
    nodes: Object.fromEntries(
      nodes.map((line) => {
        const [name, neighbours] = line.split("=");
        const [L, R] = neighbours.trim().slice(1, -1).split(", ");
        return [name.trim(), [L, R]];
      })
    ),
  };
};

export const solvePart1 = ({ steps, nodes }: ReturnType<typeof inputMapper>) => {
  if (!("AAA" in nodes && "ZZZ" in nodes)) {
    return null;
  }

  let count = 0;
  let curr = "AAA";
  while (curr != "ZZZ") {
    curr = nodes[curr][steps[count % steps.length] == "L" ? 0 : 1];
    ++count;
  }
  return count;
};

export const solvePart2 = ({ steps, nodes }: ReturnType<typeof inputMapper>) => {
  const N = Number(steps.length);
  const curr = Object.keys(nodes).filter((v) => v[2] == "A");

  // We move through every cache individually until we hit a cached entry.
  // Caches are keyed by the current step (mod N) and the node we're currently on.
  // The values are the number of steps to get there.
  const caches = curr.map(() => new Map<string, number>());
  for (let index = 0; index < curr.length; ++index) {
    const cache = caches[index];

    let node = curr[index];
    for (let count = 0; ; ++count) {
      const key = `${node},${count % N}`;
      if (cache.has(key)) {
        break;
      }

      cache.set(key, count);

      const step = steps[count % N];
      node = nodes[node][step == "L" ? 0 : 1];
    }
  }

  // Now, find all the exit distances for each node
  const nodeExits = curr.map((_, index) => {
    return Array.from(caches[index].entries())
      .map(([key, value]) => {
        return key[2] == "Z" ? BigInt(value) : null;
      })
      .filter((v): v is bigint => v !== null);
  });

  // Now, find the combination of exits that produce the least common multiple
  let currentMin: bigint | null = null;
  for (const exits of cartesianProduct(...nodeExits)) {
    const numStepsForAllExit = lcm(...exits);
    if (currentMin === null || numStepsForAllExit < currentMin) {
      currentMin = numStepsForAllExit;
    }
  }
  return currentMin;
};
