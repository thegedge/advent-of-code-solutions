/** Greatest common divisor */
const gcd = (a: bigint, b: bigint): bigint => {
  return b == 0n ? a : gcd(b, a % b);
};

/** Least common multiple */
export const lcm = (...numbers: bigint[]): bigint => {
  if (numbers.length == 0) {
    throw new Error("Cannot find LCM of empty list");
  }

  if (numbers.length == 1) {
    return numbers[0];
  }

  if (numbers.length == 2) {
    return (numbers[0] * numbers[1]) / gcd(numbers[0], numbers[1]);
  }

  return lcm(numbers[0], lcm(...numbers.slice(1)));
};

export const min = <T extends bigint | number>(a: T, b: T): T => {
  return a < b ? a : b;
};

export const max = <T extends bigint | number>(a: T, b: T): T => {
  return a > b ? a : b;
};
