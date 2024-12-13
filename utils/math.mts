/**
 * Compute the sum of n natural numbers starting from a.
 *
 *   a + (a + 1) + (a + 2) + ... + (a + n - 1)
 *     = n * a + (1 + 2 + ... + n - 1)
 *     = n * a + (n * (n - 1) / 2)
 */
export const sequenceSum = (a: number, n: number): number => {
  // We could factor out an `n`, but the `/ 2` will truncate
  return n * a + (n * (n - 1)) / 2;
};

/**
 * Compute the sum of n natural numbers starting from a (bigints).
 *
 * @see sequenceSum
 */
export const sequenceSumBig = (a: bigint, n: bigint): bigint => {
  return n * a + (n * (n - 1n)) / 2n;
};

/** Greatest common divisor */
export const gcd = (a: bigint, b: bigint): bigint => {
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

export const abs = (a: bigint): bigint => {
  return a < 0 ? -a : a;
};

export const min = <T extends bigint | number>(a: T, b: T): T => {
  return a < b ? a : b;
};

export const max = <T extends bigint | number>(a: T, b: T): T => {
  return a > b ? a : b;
};
