#!/usr/bin/env node --use-strict --stack-size=4096 --max-old-space-size=16000 --single-threaded
import { parse } from "node-html-parser";
import { mkdir, rm, statfs, writeFile } from "node:fs/promises";
import { parseArgs, styleText } from "node:util";
import { Ollama } from "ollama";
import { cachedRead, cachedReadJson, memoize } from "./src/utils/utility.mts";

type JSONScalar = string | number | bigint | boolean | null;

export type Puzzle = {
  name: `Example ${number}` | "Main input";
  input: string;
  outputPart1?: JSONScalar;
  outputPart2?: JSONScalar;
};

const SYSTEM_PROMPT = `
  You are a helpful assistant that can read and parse Advent of Code puzzles.

  The user will provide the puzzle page HTML for you, in a markdown fenced code block - that is, three backticks
  - with the language set to "html". You should extract the examples from this HTML.

  All puzzles have two parts, although if the user has yet to solve part one you may only see a single part in the
  HTML. Parts are split across \`<article class="day-desc">\` tags, which are followed by a header tag. The first
  part will have a header containing the day and title, and the second part is often just labelled "part two".

  You always respond with a JSON object containing the examples. The JSON object should have the following shape:

      {
        examples: [
          {
            name: string,
            input: string,
            outputPart1: string,
            outputPart2: string | null,
          },
        ],
      }

  The name should be "Example <number>" where <number> is the index of the example in the puzzle. For example,
  the first example in the HTML should be named "Example 1".

  The example inputs are typically in a \`<pre><code>\` block, and are unlikely to contain \`<em>\` tags. They are
  usually preceded by a phrase like "For example" or "here's another example", but this is not always the case. Keep
  the example input as it is, without any modifications. In particular, consider all whitespace important. Sometimes
  the description may break up a bigger input line by line and explain how to interpret each line, but the problem
  itself is still a single input.

  The examples outputs are often embedded in the paragraph, in a <code> block. If it's just a single number or
  string, it often will be wrapped in an <em> tag (for example, \`<code><em>123</em></code>\`), but this is not
  always the case. There's no general phrase preceding this, so you'll need to understand the context of the example
  to find the output. Some phrases that have been seen are:

    - In this example, \`<code><em>123</em></code>\`...
    - ...a total of \`<code><em>123</em></code>\`...
    - Adding up the result of each produces \`<code><em>123</em></code>\`.

  In the second part of the puzzle, there often isn't an example input, but references are made to examples that
  were shown in the first part. You'll often see phrases like "the example above" or "in the above example", but
  there could be other similar phrases that reference the example from the part one.

  If you can't find the output for part one, you should return an empty string for the output of that example.
  If you can't find the output for part two, you should return null if the user hasn't unlocked part two yet,
  but otherwise return an empty string for the output of that example.
`
  .trim()
  .replaceAll(/^  /gm, "");

const fetch = async (url: string) => {
  if (!process.env.COOKIE) {
    // You can't fetch inputs without a cookie, so grab this from your browser and put it
    // in the environment variable `COOKIE`
    throw new Error("COOKIE environment variable is not set");
  }

  const result = await globalThis.fetch(url, { headers: { Cookie: process.env.COOKIE || "" } });
  const text = await result.text();
  return text.replace(/^\n|\n$/, "");
};

const puzzlePage = memoize(async (year: number, problem: number) => {
  const result = await cachedRead(
    `${year}/${problem}/problem.html`,
    async () => await fetch(`https://adventofcode.com/${year}/day/${problem}`)
  );

  // Parse into a DOM and remove some stuff that isn't going to impact what we care about.
  // This should reduce the size of the context.
  const dom = parse(result, { blockTextElements: { code: true } });
  dom.querySelector("head")?.remove();
  dom.querySelector("header")?.remove();
  dom.querySelector("#sidebar")?.remove();
  dom.querySelectorAll("script").forEach((script) => script.remove());
  return dom;
});

const inputData = async (year: number, problem: number): Promise<Puzzle> => {
  return await cachedReadJson<Puzzle>(`${year}/${problem}/main.json`, async () => {
    const dom = await puzzlePage(year, problem);

    const results: string[] = [];
    for (const code of dom.querySelectorAll("p code")) {
      if (code.parentNode?.textContent?.includes("Your puzzle answer was")) {
        results.push(code.text.trim());
      }
    }

    return {
      name: "Main input",
      input: await fetch(`https://adventofcode.com/${year}/day/${problem}/input`),
      outputPart1: results[0],
      outputPart2: results[1],
    };
  });
};

const importProblem = async (year: number, problem: number) => {
  for (const extension of ["mts", "mjs"]) {
    try {
      const mod = await import(`./src/${year}/${problem}.${extension}`);
      if (mod.solvePart1 && mod.solvePart2) {
        return {
          solvePart1: mod.solvePart1 as (input: unknown, name: string) => string,
          solvePart2: mod.solvePart2 as (input: unknown, name: string) => string,
          inputMapper: mod.inputMapper as (input: string, name: string) => unknown,
        };
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw error;
      }

      // Assume a "not found" error
    }
  }

  return null;
};

const fetchExamples = async (year: number, problem: number): Promise<Puzzle[]> => {
  return await cachedReadJson<Puzzle[]>(`${year}/${problem}/examples.json`, async () => {
    const ollama = new Ollama();

    let upsertModel = false;
    try {
      const result = await ollama.show({ model: "aoc-helper" });
      if (result.system !== SYSTEM_PROMPT) {
        upsertModel = true;
      }
    } catch (error) {
      // Assume a not found
      upsertModel = true;
    }

    if (upsertModel) {
      const value = await ollama.create({
        from: "qwen3:4b",
        model: "aoc-helper",
        system: SYSTEM_PROMPT,
      });

      if (value.status !== "success") {
        return [];
      }
    }

    // TODO tool call to validate examples against a solution

    const dom = await puzzlePage(year, problem);

    const response = await ollama.chat({
      model: "aoc-helper",
      messages: [
        {
          role: "user",
          content: `
            Here is the puzzle page HTML for the year ${year} and problem ${problem}:

            \`\`\`html
            ${dom.toString()}
            \`\`\`
          `
            .trim()
            .replaceAll(/^            /gm, ""),
        },
      ],
      stream: true,
    });

    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let value = 0;
    process.stdout.write("\x1b[?25lFetching examples from the AI assistant  ");
    const interval = setInterval(() => {
      value = (value + 1) % frames.length;
      process.stdout.write(`\b${frames[value]}`);
    }, 100);

    let content = "";
    try {
      for await (const chunk of response) {
        if (chunk.message.content) {
          content += chunk.message.content;
        }
      }
    } finally {
      process.stdout.write("\x1b[?25h");
      clearInterval(interval);
    }

    if (!content) {
      return [];
    }

    return JSON.parse(content).examples as Puzzle[];
  });
};

const createProblemModule = async (year: number, problem: number) => {
  const dir = `./src/${year}`;
  const path = `${dir}/${problem}.mts`;

  try {
    await statfs(path);
    return; // stat throws if the file doesn't exist, so if we get here, we bail
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code !== "ENOENT") {
      throw error;
    }

    // We're good to go, the file doesn't exist!
  }

  await mkdir(dir, { recursive: true });
  await writeFile(
    path,
    `
export const inputMapper = (input: string) => {
  // Change this if you want to map the puzzle input to something more useful
  return input;
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  // Solve me
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  // Solve me
};
    `.trim()
  );
  console.log(`✅ Created new problem module at: ${path}`);
};

const main = async (argv: string[]) => {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true, // [year, problem #]
    options: {
      reload: {
        type: "boolean",
        short: "r",
        default: false,
        description: "Reload the problem description",
      },
      "only-examples": {
        type: "boolean",
        short: "e",
        default: false,
        description: "Only solve the examples",
      },
    },
  });

  const [year, problem] = positionals.map(Number);
  if (!year || !problem || Number.isNaN(year) || Number.isNaN(problem)) {
    console.error("Usage: runner <year> <problem #>");
    process.exit(1);
  }

  // TODO this should be a last resort. We can automate this by setting up the runner script to submit the result
  //    (since we have the cookie) and then can just re-run the script to get the examples and input data.
  if (values.reload) {
    await rm(`.cache/${year}/${problem}`, { recursive: true, force: true });
  }

  const mod = await importProblem(year, problem);
  if (!mod) {
    console.error("Could not find module with defined solvePart1 and solvePart2 exports. Creating one...");
    await createProblemModule(year, problem);
  }

  const puzzles = await fetchExamples(year, problem);
  puzzles.push(await inputData(year, problem));

  if (!mod) {
    process.exit(1);
  }

  const results = puzzles.map((puzzle) => {
    if (values["only-examples"] && puzzle.name === "Main input") {
      return null;
    }

    const mappedInput = mod.inputMapper?.(puzzle.input, puzzle.name) ?? puzzle.input;
    return {
      puzzle,
      part1: measure(() => mod.solvePart1(mappedInput, puzzle.name)),
      part2: measure(() => mod.solvePart2(mappedInput, puzzle.name)),
    };
  });

  for (const result of results) {
    if (!result) {
      continue;
    }

    const { puzzle, part1, part2 } = result;
    console.log(`-- ${puzzle.name} -------------------------\n`);

    const [part1Result, part1Duration] = part1;
    const part1Emoji = emojiForResult(part1Result, puzzle.outputPart1);
    console.log(
      part1Emoji,
      styleText("dim", "Part 1 result:"),
      String(part1Result),
      styleText(["italic", "cyan"], `(${part1Duration})`)
    );

    const [part2Result, part2Duration] = part2;
    const part2Emoji = emojiForResult(part2Result, puzzle.outputPart2);
    console.log(
      part2Emoji,
      styleText("dim", "Part 2 result:"),
      String(part2Result),
      styleText(["italic", "cyan"], `(${part2Duration})`)
    );
    console.log("\n");
  }
};

const measure = <T,>(fn: () => T): [result: T, duration: string] => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  let measurement: string;
  if (duration < 1) {
    measurement = `${(duration * 1000).toFixed(0)}ns`;
  } else if (duration >= 1000) {
    measurement = `${duration.toFixed(2)}s`;
  } else if (duration >= 10_000) {
    measurement = `${duration.toFixed(0)}s`;
  } else {
    measurement = `${duration.toFixed(0)}ms`;
  }

  return [result, measurement];
};

const emojiForResult = (result: unknown, expected: JSONScalar | undefined): "✅" | "❌" | "❓" => {
  if (expected == null) {
    if (result == null) {
      return "✅";
    }
    return "❓";
  }

  let comparableExpected: unknown;
  switch (typeof result) {
    case "number":
      comparableExpected = Number(expected);
      break;
    case "bigint":
      comparableExpected = BigInt(expected);
      break;
    default:
      comparableExpected = expected;
  }

  return result === comparableExpected ? "✅" : "❌";
};

// First argument: path to node
// Second argument: path to this script
main(process.argv.slice(2));
