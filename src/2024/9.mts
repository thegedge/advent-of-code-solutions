import { sumOf } from "../utils/collections.mts";
import { sequenceSumBig } from "../utils/math.mts";
import { readInputFile } from "../utils/utility.mts";

const groups = await readInputFile(import.meta);

type Sized = { size: bigint };
type File = Sized & { id: bigint };
type WithPosition<T> = T & { position: bigint };

const readData = (data: string) => {
  const files: File[] = [];
  const empties: Sized[] = [];
  data.split("").forEach((char, i) => {
    if (i % 2 == 0) {
      files.push({ size: BigInt(char), id: BigInt(i / 2) });
    } else {
      empties.push({ size: BigInt(char) });
    }
  });
  return { files, empties };
};

const solvePart1 = () => {
  const results = groups.map(readData).map(({ files, empties }) => {
    const positionedFiles: WithPosition<File>[] = [];

    let position = 0n;
    while (files.length > 0) {
      positionedFiles.push({ ...files[0], position });
      position += files[0].size;
      files.splice(0, 1);

      // Next, keep taking files from the end until we reduce the next empty space to 0
      const empty = empties[0];
      while (empty.size > 0n && files.length > 0 && files[files.length - 1].size > 0n) {
        const file = files[files.length - 1];
        if (file.size > empty.size) {
          positionedFiles.push({ ...file, position, size: empty.size });
          file.size -= empty.size;
          position += empty.size;
          break;
        }

        files.pop();
        positionedFiles.push({ ...file, position });
        position += file.size;
        empty.size -= file.size;
      }

      empties.splice(0, 1);
    }

    // console.log(positionedFiles.map((v) => `${v.id} `.repeat(Number(v.size))).join(""));
    return sumOf(positionedFiles, ({ id, position, size }) => id * sequenceSumBig(position, size));
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map(({ files, empties }) => {
    const positionedFiles: WithPosition<File>[] = [];

    let position = 0n;
    const filesWithCurrentPosition: WithPosition<File>[] = [];
    for (let i = 0; i < files.length; ++i) {
      position += i == 0 ? 0n : empties[i - 1].size;
      filesWithCurrentPosition.push({ ...files[i], position });
      position += files[i].size;
    }

    position = 0n;
    const emptiesWithCurrentPosition: WithPosition<Sized>[] = [];
    for (let i = 0; i < empties.length; ++i) {
      position += files[i].size;
      emptiesWithCurrentPosition.push({ ...empties[i], position });
      position += empties[i].size;
    }

    for (let fileIndex = files.length - 1; fileIndex > 0; --fileIndex) {
      const bestEmptyIndex = emptiesWithCurrentPosition.findIndex((empty) => files[fileIndex].size <= empty.size);
      if (bestEmptyIndex >= 0 && bestEmptyIndex < fileIndex) {
        const bestEmpty = emptiesWithCurrentPosition[bestEmptyIndex];
        positionedFiles.push({ ...files[fileIndex], position: bestEmpty.position });
        bestEmpty.size -= files[fileIndex].size;
        bestEmpty.position += files[fileIndex].size;
      } else {
        positionedFiles.push(filesWithCurrentPosition[fileIndex]);
      }
    }

    // console.log(positionedFiles.map((v) => `${v.id} `.repeat(Number(v.size))).join(""));
    return sumOf(positionedFiles, ({ id, position, size }) => id * sequenceSumBig(position, size));
  });

  console.log(results);
};

solvePart1();
solvePart2();
