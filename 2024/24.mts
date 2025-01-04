import { sortBy } from "std/collections/sort_by.ts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n---\n");

const readData = (data: string) => {
  const [inputs, gates] = data.split("\n\n");
  return {
    inputs: Object.fromEntries(inputs.split("\n").map((line) => line.split(": "))),
    gates: gates.split("\n").map((line) => {
      const [a, op, b, _arrow, output] = line.split(" ");
      return [a, op, b, output];
    }),
  };
};

const solvePart1 = () => {
  const results = groups.map(readData).map(({ inputs, gates }) => {
    while (gates.length > 0) {
      const toProcess = gates;
      gates = [];

      for (const [a, op, b, output] of toProcess) {
        if (a in inputs && b in inputs) {
          const inputA = parseInt(inputs[a]);
          const inputB = parseInt(inputs[b]);
          switch (op) {
            case "AND":
              inputs[output] = inputA & inputB;
              break;
            case "OR":
              inputs[output] = inputA | inputB;
              break;
            case "XOR":
              inputs[output] = inputA ^ inputB;
              break;
          }
        } else {
          toProcess.push([a, op, b, output]);
        }
      }
    }

    return parseInt(
      sortBy(
        Object.entries(inputs).filter(([key]) => key.startsWith("z")),
        ([key]) => key,
      ).map(([_, value]) => String(value)).reverse().join(""),
      2,
    );
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
