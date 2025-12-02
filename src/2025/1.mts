export const inputMapper = (input: string) => {
  return input.split("\n").map((line) => ({
    direction: line[0],
    amount: Number(line.slice(1)),
  }));
};

const NUM_NUMBERS = 100;

export const solvePart1 = (input: ReturnType<typeof inputMapper>) => {
  let password = 0;
  let position = 50;
  for (const { direction, amount } of input) {
    if (amount === 0) {
      continue;
    }

    const sign = direction === "L" ? -1 : 1;
    position += sign * amount;
    position %= NUM_NUMBERS;
    if (position < 0) {
      position += NUM_NUMBERS;
    }

    if (position === 0) {
      ++password;
    }
  }
  return password;
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  let password = 0;
  let position = 50;
  for (const { direction, amount } of input) {
    if (amount === 0) {
      continue;
    }

    const sign = direction === "L" ? -1 : 1;
    const newPosition = position + sign * amount;
    if (newPosition < 0) {
      password += Math.floor(-newPosition / NUM_NUMBERS);
      if (position > 0) {
        // Crossed 0
        ++password;
      }
    } else {
      password += Math.floor(newPosition / NUM_NUMBERS);
      if (newPosition == 0 && position !== 0) {
        // Landed on 0
        ++password;
      }
    }

    position = newPosition % NUM_NUMBERS;
    if (position < 0) {
      position += NUM_NUMBERS;
    }

    if (input.length < 15) {
      console.log(direction, amount, position, password);
    }
  }
  return password;
};
