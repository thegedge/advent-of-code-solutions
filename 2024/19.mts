import { sumOf } from "std/collections/sum_of.ts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n---\n");

const readData = (data: string) => {
  const [patterns, designs] = data.split("\n\n");
  return [patterns.split(", "), designs.split("\n")];
};

const solvePart1 = () => {
  const results = groups.map(readData).map(([patterns, designs]) => {
    const search = (design: string) => {
      if (design == "") {
        return true;
      }

      for (const pattern of patterns) {
        if (design.startsWith(pattern)) {
          if (search(design.slice(pattern.length))) {
            return true;
          }
        }
      }

      return false;
    };

    return sumOf(designs, (design) => search(design) ? 1 : 0);
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((group) => {
    //
  });

  console.log(results);
};

solvePart1();
solvePart2();
