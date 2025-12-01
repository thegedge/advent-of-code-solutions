#!/usr/bin/env node --use-strict --harmony --max-old-space-size=16000 --single-threaded
import { parse } from "node-html-parser";
import { mkdir, statfs, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { cachedRead, memoize } from "./src/utils/utility.mts";

type Puzzle = {
  name: string;
  input: string;
  part1Result?: string;
  part2Result?: string;
};

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
    `${year}/${problem}.html`,
    async () => await fetch(`https://adventofcode.com/${year}/day/${problem}`)
  );
  return parse(result, { blockTextElements: { code: true } });
});

const inputData = async (year: number, problem: number): Promise<Puzzle> => {
  const input = await cachedRead(
    `${year}/${problem}.in`,
    async () => await fetch(`https://adventofcode.com/${year}/day/${problem}/input`)
  );

  let results: string[] = [];
  const dom = await puzzlePage(year, problem);
  for (const code of dom.querySelectorAll("p code")) {
    if (code.parentNode?.textContent?.includes("Your puzzle answer was")) {
      results.push(code.text.trim());
    }
  }

  return {
    name: "Main input",
    input,
    part1Result: results[0],
    part2Result: results[1],
  };
};

const importProblem = async (year: number, problem: number) => {
  for (const extension of ["mts", "mjs"]) {
    try {
      const mod = await import(`./src/${year}/${problem}.${extension}`);
      if (mod.solvePart1 && mod.solvePart2) {
        return {
          solvePart1: mod.solvePart1 as (input: unknown) => string,
          solvePart2: mod.solvePart2 as (input: unknown) => string,
          inputMapper: mod.inputMapper as (input: string) => unknown,
        };
      }
    } catch (_error) {
      // Ignore
    }
  }

  return null;
};

const fetchExamples = async (year: number, problem: number): Promise<Puzzle[]> => {
  const dom = await puzzlePage(year, problem);

  const examples: Puzzle[] = [];
  const seenExamples = new Set<string>();
  for (const code of dom.querySelectorAll("pre code")) {
    const exampleText = code.text.replace(/^\n|\n$/, "");
    if (seenExamples.has(exampleText)) {
      continue;
    }

    examples.push({
      name: `Example ${examples.length + 1}`,
      input: exampleText,
      // TODO this is pretty fuzzy, see if we can build a heuristic for finding this. For example, the answer will
      //   probably always be in a <code> block, but is there some surrounding text we can typically expect?
      //   Perhaps we could just "human in the loop" this?
      part1Result: undefined,
      part2Result: undefined,
    });

    // Examples are often repeated across part one and two, so we deduplicate them
    seenExamples.add(exampleText);
  }

  return examples;
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
  const { positionals } = parseArgs({
    args: argv,
    allowPositionals: true, // [year, problem #]
  });

  const [year, problem] = positionals.map(Number);
  if (!year || !problem || Number.isNaN(year) || Number.isNaN(problem)) {
    console.error("Usage: runner <year> <problem #>");
    process.exit(1);
  }

  const mod = await importProblem(year, problem);
  if (!mod) {
    console.error("Could not find module with defined solvePart1 and solvePart2 exports. Attempting to create one...");
    await createProblemModule(year, problem);
    process.exit(1);
  }

  const puzzles = await fetchExamples(year, problem);
  puzzles.push(await inputData(year, problem));

  for (const puzzle of puzzles) {
    console.log(`-- ${puzzle.name} -------------------------\n`);

    const mappedInput = mod.inputMapper?.(puzzle.input) ?? puzzle.input;

    const part1Result = mod.solvePart1(mappedInput);
    const part1Emoji = emojiForResult(part1Result, puzzle.part1Result);
    console.log(part1Emoji, "Part 1 result:", part1Result);

    const part2Result = mod.solvePart2(mappedInput);
    const part2Emoji = emojiForResult(part2Result, puzzle.part2Result);
    console.log(part2Emoji, "Part 2 result:", part2Result);
    console.log("\n");
  }
};

const emojiForResult = (result: unknown, expected: string | undefined) => {
  if (expected === undefined) {
    return "❓";
  }

  let comparableExpected: unknown;
  switch (typeof result) {
    case "number":
      comparableExpected = Number(result);
      break;
    case "bigint":
      comparableExpected = BigInt(expected);
      break;
    default:
      comparableExpected = result;
  }

  return result === comparableExpected ? "✅" : "❌";
};

// First argument: path to node
// Second argument: path to this script
main(process.argv.slice(2));
