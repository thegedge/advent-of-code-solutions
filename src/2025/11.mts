import { sumOf } from "../utils/collections.mts";
import { memoize } from "../utils/utility.mts";

export const inputMapper = (input: string) => {
  return new Map<string, string[]>(
    input.split("\n").map((line) => {
      const [source, destinations] = line.split(": ");
      return [source, destinations.split(" ")];
    })
  );
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  if (!input.has("you")) {
    return null;
  }

  const recurse = memoize((source: string): number => {
    const destinations = input.get(source);
    if (!destinations) {
      return 1;
    }

    return sumOf(destinations, (destination) => recurse(destination));
  });

  return recurse("you");
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  if (!input.has("svr")) {
    return null;
  }

  const recurse = memoize((source: string, visitedDAC = false, visitedFFT = false): number => {
    const destinations = input.get(source);
    if (!destinations) {
      return visitedDAC && visitedFFT && source == "out" ? 1 : 0;
    }

    visitedDAC = visitedDAC || source === "dac";
    visitedFFT = visitedFFT || source === "fft";

    return sumOf(destinations, (dest) => recurse(dest, visitedDAC, visitedFFT));
  });

  return recurse("svr");
};
