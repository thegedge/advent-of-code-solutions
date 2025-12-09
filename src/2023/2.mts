import { merge, sumOf } from "../utils/collections.mts";
import { max } from "../utils/math/index.mts";

const parseLine = (game: string) => {
  const [head, tail] = game.split(":");
  const id = BigInt(head.split(" ")[1]);
  return {
    id,
    games: tail.split(";").map((game) => {
      return merge(
        { red: 0n, green: 0n, blue: 0n },
        Object.fromEntries(
          game.split(",").map((piece) => {
            const [num, color] = piece.trim().split(" ");
            return [color, BigInt(num)];
          })
        )
      );
    }),
  };
};

export const inputMapper = (data: string) => {
  return data.split("\n").map((line) => parseLine(line));
};

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  return sumOf(data, ({ id, games }) => {
    return games.every((show) => show.red <= 12 && show.green <= 13 && show.blue <= 15) ? id : 0n;
  });
};

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
  return data.reduce((sum, { games }) => {
    let minR = 0n;
    let minG = 0n;
    let minB = 0n;
    for (const show of games) {
      minR = max(minR, show.red);
      minG = max(minG, show.green);
      minB = max(minB, show.blue);
    }
    return sum + BigInt(minR) * BigInt(minG) * BigInt(minB);
  }, 0n);
};
