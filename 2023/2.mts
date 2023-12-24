import { deepMerge, sumOf } from "https://deno.land/std@0.210.0/collections/mod.ts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const parseLine = (game: string) => {
  const [head, tail] = game.split(":");
  const id = Number(head.split(" ")[1]);
  return {
    id,
    games: tail.split(";").map((game) => {
      return deepMerge(
        { red: 0, green: 0, blue: 0 },
        Object.fromEntries(
          game.split(",").map((piece) => {
            const [num, color] = piece.trim().split(" ");
            return [color, Number(num)];
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
      return games.every((show) => show.red <= 12 && show.green <= 13 && show.blue <= 15) ? id : 0;
    });
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map((lines) => {
    const games = lines.split("\n").map((line) => parseLine(line));
    return games.reduce((sum, { games }) => {
      let minR = 0;
      let minG = 0;
      let minB = 0;
      for (const show of games) {
        minR = Math.max(minR, show.red);
        minG = Math.max(minG, show.green);
        minB = Math.max(minB, show.blue);
      }
      return sum + BigInt(minR) * BigInt(minG) * BigInt(minB);
    }, 0n);
  });

  console.log(results);
};

solvePart1();
solvePart2();
