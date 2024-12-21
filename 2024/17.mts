const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n---\n");

type Opcode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const readData = (data: string) => {
  const REGISTER_REGEX = /Register (\w+): (\d+)/;
  const [registers, instructions] = data.split("\n\n");
  return {
    registers: Object.fromEntries(
      registers.split("\n").map((register) => {
        const [, name, value] = REGISTER_REGEX.exec(register)!;
        return [name, BigInt(value)];
      }),
    ),
    instructions: instructions.split(" ")[1].split(",").map((v) => parseInt(v) as Opcode),
  };
};

type Program = ReturnType<typeof readData>;

const combo = (registers: Program["registers"], n: number) => {
  switch (n) {
    case 0:
    case 1:
    case 2:
    case 3:
      return BigInt(n);
    case 4:
      return registers.A;
    case 5:
      return registers.B;
    case 6:
      return registers.C;
    case 7:
      throw new Error("Invalid combo operand (reserved)");
    default:
      throw new Error("Unknown combo operand");
  }
};

const run = (program: Program) => {
  const out = [];
  let instructionPointer = 0;
  while (instructionPointer < program.instructions.length) {
    if (program.registers.A < 0 || program.registers.B < 0 || program.registers.C < 0) {
      throw new Error("INVALID PROGRAM STATE");
    }

    const opcode = program.instructions[instructionPointer];
    switch (opcode) {
      case 0: {
        // adv
        const operand = combo(program.registers, program.instructions[instructionPointer + 1]);
        program.registers.A >>= operand;
        instructionPointer += 2;
        break;
      }
      case 1: {
        // bxl
        const operand = BigInt(program.instructions[instructionPointer + 1]);
        program.registers.B ^= operand;
        instructionPointer += 2;
        break;
      }
      case 2: {
        // bst
        const operand = combo(program.registers, program.instructions[instructionPointer + 1]);
        program.registers.B = operand & 0x7n;
        instructionPointer += 2;
        break;
      }
      case 3:
        // jnz
        if (program.registers.A === 0n) {
          instructionPointer += 2;
        } else {
          const operand = program.instructions[instructionPointer + 1];
          if (instructionPointer === operand) {
            instructionPointer += 2;
          } else {
            instructionPointer = operand;
          }
        }
        break;
      case 4: {
        // bxc
        program.registers.B ^= program.registers.C;
        instructionPointer += 2;
        break;
      }
      case 5: {
        // out
        const operand = combo(program.registers, program.instructions[instructionPointer + 1]);
        out.push(operand & 0x7n);
        instructionPointer += 2;
        break;
      }
      case 6: {
        // bdv
        const operand = combo(program.registers, program.instructions[instructionPointer + 1]);
        program.registers.B = program.registers.A >> operand;
        instructionPointer += 2;
        break;
      }
      case 7: {
        // cdv
        const operand = combo(program.registers, program.instructions[instructionPointer + 1]);
        program.registers.C = program.registers.A >> operand;
        instructionPointer += 2;
        break;
      }
      default:
        throw new Error(`Unknown opcode: ${opcode}`);
    }
  }
  return out.join(",");
};

const solvePart1 = () => {
  const results = groups.map(readData).map((program) => {
    return run(program);
  });

  console.log(results);
};

// Playing around with the given example from part two – 117440, or 0o345300 – you can find an
// interesting pattern (all numbers base 8 throughout this comment):
//
//   345300 -> 0,3,5,4,3,0
//   445300 -> 0,3,5,4,4,0
//   545300 -> 0,3,5,4,5,0
//
// Note the second-to-last digit increments when we increment the most significant digit (base 8). If we
// do the same process but for the second digit:
//
//   345300 -> 0,3,5,4,3,0
//   355300 -> 0,3,5,5,3,0
//   365300 -> 0,3,5,6,3,0
//
// Now the third-to-last digit is incrementing.
//
// So that's the first interesting pattern. What happens if we zero out everything but the top digit?
//
//   100000 -> 0,0,0,0,1,0
//   200000 -> 0,0,0,0,2,0
//   300000 -> 0,0,0,0,3,0
//
// Same deal, but zeroes everywhere else. What about smaller numbers?
//
//   111 -> 1,1,0
//   112 -> 1,1,0
//   222 -> 2,2,0
//   223 -> 2,2,0
//   333 -> 3,3,0
//   334 -> 3,3,0
//
// Oh neat, the number of digits in register A is the number of output digits.
// Also, the least significant digit seems to be ignored.
//
// Putting it all together, this program seems to take register A's base 8 representation,
// shift it to the right by three bits (i.e., modulo 8), then shift back to the left by
// three bits, and output those digits.
//
// What about the problem we really care about?
//
//   1 -> 1
//   2 -> 2
//   3 -> 3
//   ...
//   7 -> 7
//
// What if we add in some more digits and change one of them?
//
//   01 -> 0,1
//   11 -> 1,1
//   12 -> 2,1
//   13 -> 3,1
//   14 -> 4,1
//   15 -> 5,1
//   16 -> 6,1
//   17 -> 0,1
//
//   13 -> 3,1
//   23 -> 2,2
//   33 -> 2,3
//   43 -> 1,4
//   53 -> 1,4
//   63 -> 0,5
//   73 -> 0,0
//
//   113 -> 7,1,1
//   213 -> 3,1,2
//   313 -> 7,1,3
//   413 -> 3,1,4
//   513 -> 7,1,4
//   613 -> 3,1,5
//   713 -> 7,1,0
//
// Okay, not as clear a pattern here. The odd/even nature of the most significant digit seems to
// cause something to cycle, but it's not clear what. Let's try changing the second digit:
//
//   112 -> 0,1,1
//   122 -> 6,1,2
//   132 -> 4,1,3
//   142 -> 2,1,4
//   152 -> 0,1,4
//   162 -> 6,1,5
//   172 -> 4,1,0
//
// Interesting! The last two outputs are fixed, but the upper digit cycles. Let's output them all:
//
//   110 -> 0,1,1
//   210 -> 1,1,2
//   310 -> 1,1,3
//   410 -> 2,1,4
//   510 -> 2,1,4
//   610 -> 3,1,5
//   710 -> 3,1,0
//
//   111 -> 0,1,1
//   211 -> 3,1,2
//   311 -> 2,1,3
//   411 -> 5,1,4
//   511 -> 4,1,4
//   611 -> 7,1,5
//   711 -> 6,1,0
//
//   112 -> 0,1,1
//   212 -> 6,1,2
//   312 -> 4,1,3
//   412 -> 2,1,4
//   512 -> 0,1,4
//   612 -> 6,1,5
//   712 -> 4,1,0
//
//   113 -> 7,1,1
//   213 -> 3,1,2
//   313 -> 7,1,3
//   413 -> 3,1,4
//   513 -> 7,1,4
//   613 -> 3,1,5
//   713 -> 7,1,0
//
//   114 -> 5,1,1
//   214 -> 5,1,2
//   314 -> 5,1,3
//   414 -> 5,1,4
//   514 -> 5,1,4
//   614 -> 5,1,5
//   714 -> 5,1,0
//
//   115 -> 6,1,1
//   215 -> 6,1,2
//   315 -> 6,1,3
//   415 -> 6,1,4
//   515 -> 6,1,4
//   615 -> 6,1,5
//   715 -> 6,1,0
//
//   116 -> 1,1,1
//   216 -> 1,1,2
//   316 -> 1,1,3
//   416 -> 1,1,4
//   516 -> 1,1,4
//   616 -> 1,1,5
//   716 -> 1,1,0
//
//   117 -> 0,1,1
//   217 -> 0,1,2
//   317 -> 0,1,3
//   417 -> 0,1,4
//   517 -> 0,1,4
//   617 -> 0,1,5
//   717 -> 0,1,0
//
// Maybe the least significant digit influences one of several outcomes? Let's try more digits.
//
//   100010 -> 0,1,4,0,0,1
//   200010 -> 0,1,0,1,0,2
//   300010 -> 0,1,4,1,0,3
//   400010 -> 0,1,0,2,0,4
//   500010 -> 0,1,4,2,0,4
//   600010 -> 0,1,0,3,0,5
//   700010 -> 0,1,4,3,0,0
//
//   100011 -> 1,1,4,0,0,1
//   200011 -> 1,1,0,1,0,2
//   300011 -> 1,1,4,1,0,3
//   400011 -> 1,1,0,2,0,4
//   500011 -> 1,1,4,2,0,4
//   600011 -> 1,1,0,3,0,5
//   700011 -> 1,1,4,3,0,0
//
//   100012 -> 2,1,4,0,0,1
//   200012 -> 2,1,0,1,0,2
//   300012 -> 2,1,4,1,0,3
//   400012 -> 2,1,0,2,0,4
//   500012 -> 2,1,4,2,0,4
//   600012 -> 2,1,0,3,0,5
//   700012 -> 2,1,4,3,0,0
//
//   100013 -> 3,1,4,0,0,1
//   200013 -> 3,1,0,1,0,2
//   300013 -> 3,1,4,1,0,3
//   400013 -> 3,1,0,2,0,4
//   500013 -> 3,1,4,2,0,4
//   600013 -> 3,1,0,3,0,5
//   700013 -> 3,1,4,3,0,0
//
//   100014 -> 5,1,4,0,0,1
//   200014 -> 5,1,0,1,0,2
//   300014 -> 5,1,4,1,0,3
//   400014 -> 5,1,0,2,0,4
//   500014 -> 5,1,4,2,0,4
//   600014 -> 5,1,0,3,0,5
//   700014 -> 5,1,4,3,0,0
//
//   100015 -> 6,1,4,0,0,1
//   200015 -> 6,1,0,1,0,2
//   300015 -> 6,1,4,1,0,3
//   400015 -> 6,1,0,2,0,4
//   500015 -> 6,1,4,2,0,4
//   600015 -> 6,1,0,3,0,5
//   700015 -> 6,1,4,3,0,0
//
//   100016 -> 1,1,4,0,0,1
//   200016 -> 1,1,0,1,0,2
//   300016 -> 1,1,4,1,0,3
//   400016 -> 1,1,0,2,0,4
//   500016 -> 1,1,4,2,0,4
//   600016 -> 1,1,0,3,0,5
//   700016 -> 1,1,4,3,0,0
//
//   100017 -> 0,1,4,0,0,1
//   200017 -> 0,1,0,1,0,2
//   300017 -> 0,1,4,1,0,3
//   400017 -> 0,1,0,2,0,4
//   500017 -> 0,1,4,2,0,4
//   600017 -> 0,1,0,3,0,5
//   700017 -> 0,1,4,3,0,0
//
// Okay, different. There sort of seems like a pattern, but it's not clear to me yet.
//
// There are some similarities to the other program though: the number of digits in register A
// is the number of output digits.
//
// Other than that, we can also see that the most significant digit being 7 is the only way
// to get the least significant digit to be 0, which we need.
//
// So let's start playing with 7000000000000000.
//
//   7000000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,0,4,3,0,0
//   7100000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,4,4,3,1,0
//   7200000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,0,5,3,3,0
//   7300000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,4,5,3,0,0
//   7400000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,0,6,3,3,0
//   7500000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,4,6,3,2,0
//   7600000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,0,7,3,1,0
//   7700000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,4,7,3,0,0
//
// What if we take only the ones that have 3 as the second-to-last digit, which we need to
// match the program?
//
//   7200000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,0,5,3,3,0
//   7210000000000000 -> 0,0,0,0,0,0,0,0,0,0,4,0,5,6,3,0
//   7220000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,1,5,4,3,0
//   7230000000000000 -> 0,0,0,0,0,0,0,0,0,0,4,1,5,6,3,0
//   7240000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,2,5,6,3,0
//   7250000000000000 -> 0,0,0,0,0,0,0,0,0,0,4,2,5,0,3,0
//   7260000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,3,5,5,3,0
//   7270000000000000 -> 0,0,0,0,0,0,0,0,0,0,4,3,5,0,3,0
//
//   7400000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,0,6,3,3,0
//   7410000000000000 -> 0,0,0,0,0,0,0,0,0,0,4,0,6,6,3,0
//   7420000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,1,6,5,3,0
//   7430000000000000 -> 0,0,0,0,0,0,0,0,0,0,4,1,6,5,3,0
//   7440000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,2,6,0,3,0
//   7450000000000000 -> 0,0,0,0,0,0,0,0,0,0,4,2,6,4,3,0
//   7460000000000000 -> 0,0,0,0,0,0,0,0,0,0,0,3,6,5,3,0
//   7470000000000000 -> 0,0,0,0,0,0,0,0,0,0,4,3,6,0,3,0
//
// Okay, maybe we're on to something now! We're going to build a program that starts
// from the most significant digit and tries every possible digit (base 8) for that
// position. We keep all values that result in the output digit of that position
// (in reverse) that equal the output program.
//
// After I wrote that solution, I was happy to see it works for the other example too :)
//

const solvePart2 = () => {
  const results = groups.map(readData).map((program) => {
    const solutions = [0n];
    for (let digitIndex = program.instructions.length - 1; digitIndex >= 0; digitIndex--) {
      const expected = program.instructions[digitIndex];
      const potentialSolutions = solutions.splice(0);
      for (const solution of potentialSolutions) {
        for (let digit = 0; digit < 8; digit++) {
          const registerA = solution | (BigInt(digit) << (3n * BigInt(digitIndex)));
          const maybeSolution = run({ ...program, registers: { ...program.registers, A: registerA } });
          if (Number(maybeSolution.split(",")[digitIndex]) === expected) {
            solutions.push(registerA);
          }
        }
      }
    }

    // The number of digits, base 8, is the same as the output.
    // We start by trying to find the first octal digit that matches the output and work our way back.
    return solutions.join(" | ");
  });

  console.log(results);
};

solvePart1();
solvePart2();
