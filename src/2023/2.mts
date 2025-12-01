import { readFile } from "node:fs/promises";
import { merge, sumOf } from "../utils/collections.mts";
import { max } from "../utils/math.mts";

const groups = (await readFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname, "utf-8")).split("\n\n");

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

const solvePart1 = () => {
  const results = groups.map((lines) => {
    const games = lines.split("\n").map((line) => parseLine(line));
    return sumOf(games, ({ id, games }) => {
      return games.every((show) => show.red <= 12 && show.green <= 13 && show.blue <= 15) ? id : 0n;
    });
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map((lines) => {
    const games = lines.split("\n").map((line) => parseLine(line));
    return games.reduce((sum, { games }) => {
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
  });

  console.log(results);
};

solvePart1();
solvePart2();
