const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n---\n");

const readData = (data: string) => {
  const REGISTER_REGEX = /Register (\w+): (\d+)/;
  const [registers, instructions] = data.split("\n\n");
  return {
    registers: Object.fromEntries(
      registers.split("\n").map((register) => {
        const [, name, value] = REGISTER_REGEX.exec(register)!;
        return [name, parseInt(value)];
      }),
    ),
    instructions: instructions.split(" ")[1].split(",").map((v) => parseInt(v)),
  };
};

type Program = ReturnType<typeof readData>;

const combo = (registers: Program["registers"], n: number) => {
  switch (n) {
    case 0:
    case 1:
    case 2:
    case 3:
      return n;
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
  // console.log(program.instructions);
  while (instructionPointer < program.instructions.length) {
    const opcode = program.instructions[instructionPointer];
    // console.log(instructionPointer, opcode, program.instructions[instructionPointer + 1]);
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
        const operand = program.instructions[instructionPointer + 1];
        program.registers.B ^= operand;
        instructionPointer += 2;
        break;
      }
      case 2: {
        // bst
        const operand = combo(program.registers, program.instructions[instructionPointer + 1]);
        program.registers.B = operand & 0x7;
        instructionPointer += 2;
        break;
      }
      case 3:
        // jnz
        if (program.registers.A === 0) {
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
        out.push(operand & 0x7);
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

const solvePart2 = () => {
  const results = groups.map(readData).map((group) => {
    //
  });

  console.log(results);
};

solvePart1();
solvePart2();
