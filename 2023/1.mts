import { sumOf } from "../utils/collections.mts";

const groups = (
  await Deno.readTextFile(
    new URL("", import.meta.url.replace(".mts", ".in")).pathname
  )
).split("\n\n");

const solvePart1 = () => {
  const FIRST_DIGIT_REGEX = /^[^\d]*?(\d)/;
  const LAST_DIGIT_REGEX = /(\d)[^\d]*?$/;

  const calibrations = groups.map((group) => {
    try {
      return sumOf(group.split("\n"), (line) => {
        const first = line.match(FIRST_DIGIT_REGEX)![1];
        const last = line.match(LAST_DIGIT_REGEX)![1];
        return BigInt(first + last);
      });
    } catch (_error) {
      // Second test example has a line with no numbers
      return null;
    }
  });

  console.log(calibrations);
};

const solvePart2 = () => {
  // Use a lookahead regex so we can get overlapping matches
  const DIGIT_REGEX = /(?=(one|two|three|four|five|six|seven|eight|nine|\d))/g;
  const NUMBERS: Record<string, string> = {
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
  };

  const toNum = (s: string) => {
    return NUMBERS[s] || s;
  };

  const calibrations = groups.map((group) => {
    return sumOf(group.split("\n"), (line) => {
      const digits = Array.from(line.matchAll(DIGIT_REGEX)).map(
        (match) => match[1]
      );
      const first = toNum(digits[0]);
      const last = toNum(digits[digits.length - 1]);
      return BigInt(first + last);
    });
  });

  console.log(calibrations);
};

solvePart1();
solvePart2();
