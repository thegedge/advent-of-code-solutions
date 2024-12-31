import { sumOf } from "../utils/collections.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const readData = (data: string) => {
  return data.split("\n").map((v) => BigInt(v));
};

const _16777216 = (1n << 24n) - 1n; // bitwise and with this value is same as modulo 16777216

const mixAndPrune = (a: bigint, b: bigint) => {
  return (a ^ b) & _16777216;
};

const solvePart1 = () => {
  const results = groups.map(readData).map((group) => {
    return sumOf(group, (value) => {
      let secret = value;
      for (let i = 0; i < 2000; ++i) {
        secret = mixAndPrune(secret, secret << 6n); // * 64
        secret = mixAndPrune(secret, secret >> 5n); // ÷ 32
        secret = mixAndPrune(secret, secret << 11n); // * 2048
      }

      // console.log(value, secret);
      return secret;
    });
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
