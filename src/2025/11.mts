import { sumOf } from "../utils/collections.mts";

export const inputMapper = (input: string) => {
  return new Map<string, string[]>(
    input.split("\n").map((line) => {
      const [source, destinations] = line.split(": ");
      return [source, destinations.split(" ")];
    })
  );
};

const numPaths = (input: ReturnType<typeof inputMapper>) => {
  const visited = new Map<string, number>();
  const recurse = (source: string): number => {
    const destinations = input.get(source);
    if (!destinations) {
      return 1;
    }

    if (visited.has(source)) {
      return visited.get(source)!;
    }

    const sum = sumOf(destinations, (destination) => recurse(destination));
    visited.set(source, sum);
    return sum;
  };

  return recurse("you");
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  return numPaths(input);
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  // Solve me
};
