import { range, sumOf, zip } from "../utils/collections.mts";

export const inputMapper = (data: string): [times: string, distances: string] => {
  const [times, distances] = data.trim().split("\n");
  return [times, distances];
};

const mapDataForPart1 = ([times, distances]: ReturnType<typeof inputMapper>) => {
  return zip(times.trim().split(/ +/).slice(1).map(Number), distances.trim().split(/ +/).slice(1).map(Number));
};

const mapDataForPart2 = ([times, distances]: ReturnType<typeof inputMapper>) => {
  return [
    [
      Number(times.trim().split(":")[1].replaceAll(" ", "")),
      Number(distances.trim().split(":")[1].replaceAll(" ", "")),
    ],
  ];
};

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  return mapDataForPart1(data).reduce((product, [time, distance]) => {
    const numWaysCanWin = sumOf(range(time), (v) => {
      return v * (time - v) > distance ? 1n : 0n;
    });
    return product * numWaysCanWin;
  }, 1n);
};

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
  // Not the most efficient way to do this, but it's fast enough.
  // A smarter way would be to find the zeroes of the function, and then take the distance between.
  return mapDataForPart2(data).reduce((product, [time, distance]) => {
    const numWaysCanWin = sumOf(range(time), (v) => {
      return v * (time - v) > distance ? 1n : 0n;
    });
    return product * numWaysCanWin;
  }, 1n);
};
