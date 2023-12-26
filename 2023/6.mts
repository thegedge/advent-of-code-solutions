import { range, sumOf, zip } from "../utils/utils.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const readData1 = (data: string) => {
  const [times, distances] = data.trim().split("\n");
  return zip(times.trim().split(/ +/).slice(1).map(Number), distances.trim().split(/ +/).slice(1).map(Number));
};

const readData2 = (data: string) => {
  const [times, distances] = data.trim().split("\n");
  return [
    [
      Number(times.trim().split(":")[1].replaceAll(" ", "")),
      Number(distances.trim().split(":")[1].replaceAll(" ", "")),
    ],
  ];
};

const solvePart1 = () => {
  const results = groups.map(readData1).map((races) => {
    return races.reduce((product, [time, distance]) => {
      const numWaysCanWin = sumOf(range(time), (v) => {
        return v * (time - v) > distance ? 1n : 0n;
      });
      return product * numWaysCanWin;
    }, 1n);
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData2).map((races) => {
    // Not the most efficient way to do this, but it's fast enough.
    // A smarter way would be to find the zeroes of the function, and then take the distance between.
    return races.reduce((product, [time, distance]) => {
      const numWaysCanWin = sumOf(range(time), (v) => {
        return v * (time - v) > distance ? 1n : 0n;
      });
      return product * numWaysCanWin;
    }, 1n);
  });

  console.log(results);
};

solvePart1();
solvePart2();
