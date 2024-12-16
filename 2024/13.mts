import { sumOf } from "../utils/collections.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n---\n");

const LINE_REGEX = /.+?: X[+=](?<x>\d+), Y[+=](?<y>\d+)/;

const readData = (data: string) => {
  return data.split("\n\n").map((line) => {
    const [a, b, prize] = line.split("\n").map((line) => {
      const { x, y } = LINE_REGEX.exec(line)!.groups!;
      return { x: BigInt(x), y: BigInt(y) };
    });

    return { a, b, prize };
  });
};

const solvePart1 = () => {
  const results = groups.map(readData).map((group) => {
    return sumOf(group, ({ a, b, prize }) => {
      // Solving a system of equations. We need to find integers j and k that satisfy:
      //   prize_x = j * a_x + k * b_x
      //   prize_y = j * a_y + k * b_y
      //
      // We can rearrange for j on the first equation:
      //   j = (prize_x - k * b_x) / a_x
      //
      // Then substitute into the second equation:
      //   prize_y = ((prize_x - k * b_x) / a_x) * a_y + k * b_y
      //
      // And rearrange for k:
      //   a_x * prize_y = (prize_x - k * b_x) * a_y + k * a_x * b_y
      //   a_x * prize_y = prize_x * a_y - k * b_x * a_y + k * a_x * b_y
      //   a_x * prize_y = prize_x * a_y + k * (a_x * b_y - b_x * a_y)
      //   k = (a_x * prize_y - prize_x * a_y) / (a_x * b_y - b_x * a_y)
      //
      // Once we have k, we can substitute back into the first equation to get j.
      //   j = (prize_x - k * b_x) / a_x
      if (a.x * b.y - b.x * a.y == 0n) {
        return 0n; // no solution
      }

      const k = (a.x * prize.y - prize.x * a.y) / (a.x * b.y - b.x * a.y);
      const j = (prize.x - k * b.x) / a.x;

      if (j * a.x + k * b.x != prize.x || j * a.y + k * b.y != prize.y) {
        return 0n; // no integer solution
      }

      return 3n * j + k;
    });
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((group) => {
  });

  console.log(results);
};

solvePart1();
solvePart2();
