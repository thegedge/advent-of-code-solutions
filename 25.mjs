import { sum } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./25.in", "utf8");

const VALUES = {
  2: 2,
  1: 1,
  0: 0,
  "-": -1,
  "=": -2,
};

const toDecimal = (snafu) => {
  let power = 1;
  let value = 0;
  for (let index = snafu.length - 1; index >= 0; --index) {
    value += power * VALUES[snafu.charAt(index)];
    power *= 5;
  }
  return value;
};

const toSnafu = (decimal) => {
  let snafu = "";
  while (decimal > 0) {
    const rem = decimal % 5;

    // console.log(decimal, rem, snafu);
    let carry = 0;
    switch (rem) {
      case 0:
      case 1:
      case 2:
        snafu = String(rem) + snafu;
        break;
      case 3:
        snafu = "=" + snafu;
        carry = 1;
        break;
      case 4:
        snafu = "-" + snafu;
        carry = 1;
        break;
    }

    decimal = Math.floor(decimal / 5) + carry;
  }

  return snafu;
};

// Part 1`
data
  .split("\n---\n")
  .map((group) => toSnafu(sum(group.split("\n").map(toDecimal))))
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n---\n")
  .map((group) => {
    //
  })
  .forEach((v) => console.log(v));
