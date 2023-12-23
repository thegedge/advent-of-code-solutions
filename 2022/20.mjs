import { range } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./20.in", "utf8");

const mod = (v, n) => (v < 0 ? (v % n) + n : v % n);

const move = (array, index, amount) => {
  if (amount == 0n) {
    return;
  }

  let newIndex = mod(index + amount, array.length - 1);

  const value = array[index];
  if (index <= newIndex) {
    // Shift relevant items back
    for (let i = index; i < newIndex; ++i) {
      array[i] = array[i + 1];
    }
  } else {
    // Shift relevant items up
    for (let i = index; i > newIndex; --i) {
      array[i] = array[i - 1];
    }
  }

  array[newIndex] = value;
  return array;
};

const mix = (numbers, original = numbers) => {
  const moved = range(numbers.length).map(() => false);
  for (let iter = 0; iter < numbers.length; ++iter) {
    const indexToMove = moved.findIndex((v) => !v);
    const value = numbers[indexToMove];
    moved[indexToMove] = true;
    move(moved, indexToMove, value);
    move(numbers, indexToMove, value);
  }
  return numbers;
};

// Part 1
data
  .split("\n---\n")
  .map((group) => {
    const numbers = group.split("\n").map(Number);
    const file = mix(numbers);
    const zeroIndex = file.findIndex((v) => v == 0);
    return (
      file[(1000 + zeroIndex) % file.length] +
      file[(2000 + zeroIndex) % file.length] +
      file[(3000 + zeroIndex) % file.length]
    );
  })
  .map(Number)
  .forEach((v) => console.log(v));

// Part 2
data
  .split("\n---\n")
  .map((group) => {
    const numbers = group
      .split("\n")
      .map(Number)
      .map((v) => v * 811589153);
    const file = range(10).reduce((prev, _iteration) => mix(prev, numbers), numbers);
    const zeroIndex = file.findIndex((v) => v == 0);
    return (
      file[(1000 + zeroIndex) % file.length] +
      file[(2000 + zeroIndex) % file.length] +
      file[(3000 + zeroIndex) % file.length]
    );
  })
  .map(Number)
  .forEach((v) => console.log(v));
