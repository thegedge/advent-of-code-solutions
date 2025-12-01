import { combinations, nonOverlappingPairs, range } from "../utils/collections.mts";
import { readInputFile } from "../utils/utility.mts";

const groups = await readInputFile(import.meta, "\n---\n");

const readData = (data: string) => {
  const [inputs, gates] = data.split("\n\n");
  return {
    inputs: Object.fromEntries(
      inputs.split("\n").map((line) => {
        const [a, b] = line.split(": ");
        return [a, parseInt(b)];
      })
    ) as Record<string, number>,
    gates: gates.split("\n").map((line) => {
      const [a, op, b, _arrow, output] = line.split(" ");
      return [a, op, b, output] as Gate;
    }),
  };
};

type Gate = [string, "OR" | "AND" | "XOR", string, string];

const OPS = {
  AND: (a: number, b: number) => a & b,
  OR: (a: number, b: number) => a | b,
  XOR: (a: number, b: number) => a ^ b,
};

const process = ({ inputs, gates }: ReturnType<typeof readData>) => {
  const outputs = { ...inputs };
  while (gates.length > 0) {
    const toProcess = [...gates];
    gates = [];

    for (const [a, op, b, output] of toProcess) {
      if (a in outputs && b in outputs) {
        const inputA = outputs[a];
        const inputB = outputs[b];
        outputs[output] = OPS[op](inputA, inputB);
      } else {
        gates.push([a, op, b, output]);
      }
    }

    // Every loop should process at least one gate. If not, assume an infinite loop.
    if (toProcess.length == gates.length) {
      return null;
    }
  }
  return outputs;
};

const computeValueFor = (values: Record<string, number>, gatePrefix: string) => {
  return Object.entries(values).reduce((acc, [key, value]) => {
    if (value == 0 || !key.startsWith(gatePrefix)) {
      return acc;
    }
    return acc | (1n << BigInt(key.slice(1)));
  }, 0n);
};

const solvePart1 = () => {
  const results = groups.map(readData).map(({ inputs, gates }) => {
    const outputs = process({ inputs, gates });
    if (outputs === null) {
      return;
    }
    return computeValueFor(outputs, "z");
  });

  console.log(results);
};

const GATE_OUTPUT_INDEX = 3;

const solvePart2 = () => {
  const results = groups.map(readData).map(({ inputs, gates }, index) => {
    if (index != 2) {
      // Just ignore everything but the input we need to solve
      return;
    }

    // If you visualize the gates as a graph, you can see that the gates are connected in a way that
    // looks like a line with sections feeding into the next, eventually outputting to the z bits.
    // The x/y gates are always inputs, that feed into some intermediate gates.
    //
    // Essentially, it looks like a https://en.wikipedia.org/wiki/Adder_(electronics)#Ripple-carry_adder!
    //
    // How do they work? Well, addition is implemented with XOR + carry bit. Let's consider a small
    // example with one bit:
    //
    //    a | b | a ^ b | a & b | a + b
    //   ---|---|-------|-------|-------
    //    0 | 0 |   0   |   0   |  00
    //    0 | 1 |   1   |   0   |  01
    //    1 | 0 |   1   |   0   |  01
    //    1 | 1 |   0   |   1   |  10
    //
    // So XOR computes the correct value for the same-indexed bit in a sum, and we only need to
    // carry a bit when both bits are 1. This is the same as the AND operation. If you look at the
    // graph, you can see that's exactly what x00 and y00 are doing, in combination with an
    // intermediate gate to store the carry bit!
    //
    // But now we have to consider the carry bit in the calculation moving forward:
    //
    //    a | b | c | (a ^ b) ^ c | a + b + c
    //   ---|---|---|-------------|-----------
    //    0 | 0 | 0 |      0      |     00
    //    0 | 0 | 1 |      1      |     01
    //    0 | 1 | 0 |      1      |     01
    //    0 | 1 | 1 |      0      |     10
    //    1 | 0 | 0 |      1      |     01
    //    1 | 0 | 1 |      0      |     10
    //    1 | 1 | 0 |      1      |     10
    //    1 | 1 | 1 |      1      |     11
    //
    // So XOR still works for the bit in the same index, but the carry bit is a bit more complicated
    // now. You could convert the above truth table into a boolean expression and simplify it, but
    // you can also think about it another way: there's a carry bit if any pairing of inputs would
    // have a carry bit. In other words, (a & b) | (a & c) | (b & c). You can simplify that a bit by
    // combining one grouping of those: (a & b) | (c & (a | b)). Given the above truth table, you can
    // also see that (a & b) | (c & (a ^ b)) works too, since the left-hand side takes care of the
    // case where both a and b are 1. This is a preferred form, since you can reuse the a ^ b value.
    //
    // If we chain these together, we have our ripple adder. Let's do this for the first four bits:
    //
    //  z0 = x0 ^ y0
    //  c0 = x0 & y0
    //
    //  z1 = x1 ^ y1 ^ c0
    //  c1 = (x1 & y1) | (c0 & (x1 ^ y1))
    //
    //  z2 = x2 ^ y2 ^ c1
    //     = x2 ^ y2 ^ ((x1 & y1) | (c0 & (x1 ^ y1)))
    //  c2 = (x2 & y2) | (c1 & (x2 ^ y2))
    //     = (x2 & y2) | (((x1 & y1) | (c0 & (x1 ^ y1))) & (x2 ^ y2))
    //
    //  z3 = x3 ^ y3 ^ c2
    //     = x3 ^ y3 ^ ((x2 & y2) | (((x1 & y1) | (c0 & (x1 ^ y1))) & (x2 ^ y2)))
    //  c3 = (x3 & y3) | (c2 & (x3 ^ y3))
    //     = (x3 & y3) | ((((x2 & y2) | (((x1 & y1) | (c0 & (x1 ^ y1))) & (x2 ^ y2))) & (x3 ^ y3))
    //
    // Now, how can we use this knowledge to find broken gates?
    //
    // Next, if we have a <op> b = z#, <op> _has_ to be XOR, unless it's the most significant bit.
    // If that's not the case, we're definitely going to have to swap that gate.
    //
    // Otherwise, if the output isn't a z# gate, it cannot be a XOR unless x/y are the inputs (note
    // this pattern in the above equations).
    //
    // If you use those rules to filter the gates, you'll find 6 broken gates!
    //
    // We just brute force the last two (with some statistical confidence).
    // Not the fastest solution (~2.5 minutes), but I had exhausted my brain/cleverness for the day ;)
    //
    const badGateIndexes: number[] = [-1, -1];
    gates.forEach((gate, index) => {
      const [a, op, b, out] = gate;

      // Edges for for graphviz visualization
      // console.log(`${out} -> { ${a} ${b} } [label="${op}" ];`);

      if (out.startsWith("z")) {
        if (out != "z45" && op != "XOR") {
          // z45 is the last gate
          badGateIndexes.push(index);
        }
      } else {
        if (!(a.startsWith("x") && b.startsWith("y")) && !(a.startsWith("y") && b.startsWith("x")) && op == "XOR") {
          badGateIndexes.push(index);
        }
      }
    });

    // Once we find the right answer, we put it in the "" below and increase the number of iterations
    // of randomizing inputs to be REALLY sure we have the right answer
    // badGateIndexes.length = 0;
    // badGateIndexes.push(..."".split(",").map((v) => gates.findIndex(([a, op, b, out]) => out == v)));

    const inputKeys = Object.keys(inputs);

    for (const remaining of combinations(range(gates.length), 2)) {
      if (badGateIndexes.includes(remaining[0]) || badGateIndexes.includes(remaining[1])) {
        continue;
      }

      badGateIndexes[0] = remaining[0];
      badGateIndexes[1] = remaining[1];
      for (const [[a1, b1], [a2, b2], [a3, b3], [a4, b4]] of nonOverlappingPairs(badGateIndexes, 4)) {
        const swappedGates = [...gates];
        swappedGates[a1] = [gates[a1][0], gates[a1][1], gates[a1][2], gates[b1][GATE_OUTPUT_INDEX]];
        swappedGates[b1] = [gates[b1][0], gates[b1][1], gates[b1][2], gates[a1][GATE_OUTPUT_INDEX]];
        swappedGates[a2] = [gates[a2][0], gates[a2][1], gates[a2][2], gates[b2][GATE_OUTPUT_INDEX]];
        swappedGates[b2] = [gates[b2][0], gates[b2][1], gates[b2][2], gates[a2][GATE_OUTPUT_INDEX]];
        swappedGates[a3] = [gates[a3][0], gates[a3][1], gates[a3][2], gates[b3][GATE_OUTPUT_INDEX]];
        swappedGates[b3] = [gates[b3][0], gates[b3][1], gates[b3][2], gates[a3][GATE_OUTPUT_INDEX]];
        swappedGates[a4] = [gates[a4][0], gates[a4][1], gates[a4][2], gates[b4][GATE_OUTPUT_INDEX]];
        swappedGates[b4] = [gates[b4][0], gates[b4][1], gates[b4][2], gates[a4][GATE_OUTPUT_INDEX]];

        // Try a few randomized inputs to see if it always computes the sum. Possible it's still the wrong answer,
        // but statistically unlikely (and more unlikely as we increase the number of inputs)
        const sumsCorrect = range(5).every(() => {
          for (const key of inputKeys) {
            inputs[key] = Math.random() < 0.5 ? 0 : 1;
          }

          const output = process({ inputs, gates: swappedGates });
          if (!output) {
            return false;
          }

          const x = computeValueFor(inputs, "x");
          const y = computeValueFor(inputs, "y");
          const z = computeValueFor(output, "z");
          return x + y == z;
        });

        if (sumsCorrect) {
          return [
            gates[a1][GATE_OUTPUT_INDEX],
            gates[b1][GATE_OUTPUT_INDEX],
            gates[a2][GATE_OUTPUT_INDEX],
            gates[b2][GATE_OUTPUT_INDEX],
            gates[a3][GATE_OUTPUT_INDEX],
            gates[b3][GATE_OUTPUT_INDEX],
            gates[a4][GATE_OUTPUT_INDEX],
            gates[b4][GATE_OUTPUT_INDEX],
          ]
            .sort()
            .join(",");
        }
      }
      badGateIndexes[0] = -1;
      badGateIndexes[1] = -1;
    }
  });
  console.log(results);
};

solvePart1();
solvePart2();
