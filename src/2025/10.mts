import { arrayOf, sumOf } from "../utils/collections.mts";

export const inputMapper = (input: string) => {
  return input
    .split("\n")
    .map((line) => /\[(?<lights>[.#]+)\] (?<schematics>[^{]+) \{(?<reqs>\d+(,\d+)+)\}/.exec(line))
    .map((match) => {
      const numLights = match!.groups!.lights.length;
      return {
        numLights,

        // The initial state of the lights as a bit mask.
        initialLights: match!.groups!.lights.split("").reduce((acc, ch) => (acc << 1) | (ch === "#" ? 1 : 0), 0),

        // These are bit masks that you can use to toggle a light state (via XOR)
        buttons: match!.groups!.schematics.split(" ").map((groups) =>
          groups
            .slice(1, -1)
            .split(",")
            .map((v) => Number(v))
            .sort()
            .reduce((acc, v) => acc | (1 << (numLights - v - 1)), 0)
        ),

        // The joltage requirements
        reqs: match!.groups!.reqs.split(",").map((v) => Number(v)),
      };
    });
};

// Construct a graph of the light states and the minimum number of steps to reach each state by
// recursively toggling all lights.
const lightGraph = (numLights: number, buttons: number[]) => {
  // This could be a massive array, but the input has at most 10 lights, so we only have to consider 1024 states.
  const smallest: number[] = arrayOf(2 ** numLights, Infinity);

  const recurse = (lights: number, steps: number) => {
    if (steps >= smallest[lights]) {
      // We've already been at this state with a shorter set of steps, so we can stop.
      return;
    }

    smallest[lights] = steps;
    for (const button of buttons) {
      recurse(lights ^ button, steps + 1);
    }
  };

  recurse(0, 0);
  return smallest;
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(input, (item) => {
    const graph = lightGraph(item.numLights, item.buttons);
    return graph[item.initialLights];
  });
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  // Solve me
};
