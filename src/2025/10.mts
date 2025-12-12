import { solve } from "yalps";
import { arrayOf, sumOf } from "../utils/collections.mts";

export const inputMapper = (input: string) => {
  return input
    .split("\n")
    .map((line) => /\[(?<lights>[.#]+)\] (?<schematics>[^{]+) \{(?<reqs>\d+(,\d+)+)\}/.exec(line))
    .map((match) => {
      const numLights = match!.groups!.lights.length;
      const buttons = match!.groups!.schematics.split(" ").map((groups) =>
        groups
          .slice(1, -1)
          .split(",")
          .map((v) => Number(v))
          .sort()
      );

      return {
        line: match!.input,
        numLights,

        // The initial state of the lights as a bit mask.
        initialLights: match!.groups!.lights.split("").reduce((acc, ch) => (acc << 1) | (ch === "#" ? 1 : 0), 0),

        // These are bit masks that you can use to toggle a light state (via XOR)
        buttons: buttons.map((button) => ({
          numbers: button,
          mask: button.reduce((acc, v) => acc | (1 << (numLights - v - 1)), 0),
        })),

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
    const graph = lightGraph(
      item.numLights,
      item.buttons.map((b) => b.mask)
    );
    return graph[item.initialLights];
  });
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  // I tried REALLY hard to solve this with a search approach, but I couldn't figure out how to
  // prune the search space in a way that allowed us to solve it in a reasonable time.
  //
  // Instead, I took a linear programming approach to solve the problem.
  //
  //    x_i = number of times we pressed button i
  //    c_i = 1
  //    a_ij = 1 if button i affects light j, 0 otherwise
  //    b_j = joltage requirement for light j
  //
  // If you're not familiar with these variables, check out the `lpSolve` function in the
  // `utils/math/simplex.mts` file. If you work that out though, what you find is:
  //
  //    transpose(c) * x = sum(x_i)
  //                     = # of button presses (what we want to minimize)
  //
  //    A * x = number of times we would have adjusted the joltage for each light
  //         >= the joltage requirements, as specified in b
  //
  return sumOf(input, (item, index) => {
    const solution = solve({
      direction: "minimize",
      objective: "weight",
      integers: true,
      constraints: Object.fromEntries(
        item.reqs.map((v, index) => [
          //
          `light${index}`,
          { equal: v },
        ])
      ),
      variables: Object.fromEntries(
        item.buttons.map(({ numbers }, index) => [
          `button${index}`,
          Object.fromEntries(
            item.reqs
              //
              .map((_, index) => [`light${index}`, numbers.includes(index) ? 1 : 0])
              .concat([["weight", 1]])
          ),
        ])
      ),
    });

    return solution.result;
  });
};
