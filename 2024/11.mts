const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const readData = (data: string) => {
  return data.split(" ").map((num) => BigInt(num));
};

const blink = (numbers: bigint[]) => {
  return numbers.flatMap((num) => {
    if (num == 0n) {
      return [1n];
    }

    const snum = String(num);
    if (snum.length % 2 == 0) {
      const half = Math.ceil(snum.length / 2);
      return [BigInt(snum.slice(0, half)), BigInt(snum.slice(half))];
    } else {
      return [num * 2024n];
    }
  });
};

const solvePart1 = () => {
  const results = groups.map(readData).map((group) => {
    for (let iteration = 0; iteration < 25; iteration++) {
      group = blink(group);
    }
    return group.length;
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((group) => {
    // Too slow with initial attempt
    // for (let iteration = 0; iteration < 75; iteration++) {
    //   group = blink(group);
    // }
    // return group.length;
  });

  console.log(results);
};

solvePart1();
solvePart2();
