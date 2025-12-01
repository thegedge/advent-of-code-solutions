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

/**
 * Computes the modulo (v % n) as per the mathematical definition (i.e. always positive).
 */
export const mod = (v: number, n: number): number => {
  const value = v % n;
  if (value < 0) {
    return value + n;
  }
  return value;
};

export const max = <T extends bigint | number>(a: T, b: T): T => {
  return a > b ? a : b;
};

/**
 * Solve a system of two linear equations in two variables (integers).
 *
 * The equations are of the form:
 *   a * x + b * y = c
 *   d * x + e * y = f
 */
export const solveSystem = (a: bigint, b: bigint, c: bigint, d: bigint, e: bigint, f: bigint): [bigint, bigint] | null => {
  // We can solve this system by rearranging the first equation for x:
  //   x = (c - b * y) / a
  //
  // Then substitute into the second equation:
  //   f = d * ((c - b * y) / a) + e * y
  //
  // And rearrange for y:
  //   a * f = d * (c - b * y) + e * a * y
  //   a * f = d * c - d * b * y + e * a * y
  //   a * f = d * c + y * (e * a - d * b)
  //   y = (a * f - d * c) / (e * a - d * b)
  //
  // Once we have y, we can substitute back into the first equation to get x.
  //   x = (c - b * y) / a

  // No (finite) solution
  if (a == 0n || b == 0n || e * a - d * b == 0n) {
    return null;
  }

  const y = (a * f - d * c) / (e * a - d * b);
  const x = (c - b * y) / a;

  // No integer solution
  if (a * x + b * y != c || d * x + e * y != f) {
    return null;
  }

  return [x, y];
};
