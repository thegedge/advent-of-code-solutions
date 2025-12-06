import { sumOf, transpose } from "../utils/collections.mts";

export const inputMapper = (input: string) => {
  return input.split("\n");
};

const processProblem1 = (input: string[]) => {
  const values = input.map((line) => line.split(/\s+/).filter(Boolean));
  const operations = values.pop()!.map((op) => operation(op));
  const problems = transpose(values.map((line) => line.map(BigInt)));
  return { operations, problems };
};

const processProblem2 = function* (input: string[]) {
  const operationsRow = input.pop()!;

  // Nothing fancy here, we're just iterating backwards through the columns as specified by the
  // problem description. Fortunately, I've verified that the problem ends once we reach an
  // operation, so we can yield everything we've collected so far.
  //
  // There's likely a nice solution with `transponse` too, but this is what came to mind first :)
  let numbers = [];
  for (let index = input[0].length - 1; index >= 0; --index) {
    let number = "";
    for (let row = 0; row < input.length; ++row) {
      number += input[row][index];
    }
    numbers.push(BigInt(number));

    const op = operationsRow[index];
    if (op != " ") {
      yield [numbers, operation(op)] as const;
      numbers = [];
      --index; // skip the empty column
    }
  }
};

// Named functions to make debugging easier
function add(a: bigint, b: bigint) {
  return a + b;
}

function mul(a: bigint, b: bigint) {
  return a * b;
}

const operation = (operation: string) => {
  switch (operation) {
    case "+":
      return add;
    case "*":
      return mul;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  const { problems, operations } = processProblem1(input);
  return sumOf(problems, (numbers, index) => {
    const op = operations[index];
    return numbers.reduce((acc, num) => op(acc, num));
  });
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  return sumOf(processProblem2(input), ([numbers, op]) => {
    return numbers.reduce((acc, num) => op(acc, num));
  });
};
