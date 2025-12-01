import { readFile } from "node:fs/promises";

const groups = (await readFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname, "utf-8")).split("\n\n");

const classify = (value: string) => {
  switch (value) {
    case ".":
      return "empty";
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      return "digit";
    case "*":
      return "gear";
    default:
      return "part";
  }
};

const solvePart1 = () => {
  const results = groups.map((group) => {
    const map = group.split("\n").map((line) => line.split(""));

    // Preprocess: fill in cells near a part
    const nearPartMap: boolean[][] = map.map((row) => new Array(row.length).fill(false));
    map.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        switch (classify(cell)) {
          case "gear":
          case "part": {
            nearPartMap[rowIndex][colIndex] = true;
            if (colIndex > 0) nearPartMap[rowIndex][colIndex - 1] = true;
            if (colIndex < row.length - 1) nearPartMap[rowIndex][colIndex + 1] = true;
            if (rowIndex > 0) nearPartMap[rowIndex - 1][colIndex] = true;
            if (rowIndex < map.length - 1) nearPartMap[rowIndex + 1][colIndex] = true;
            if (rowIndex > 0 && colIndex > 0) nearPartMap[rowIndex - 1][colIndex - 1] = true;
            if (rowIndex < map.length - 1 && colIndex > 0) nearPartMap[rowIndex + 1][colIndex - 1] = true;
            if (rowIndex > 0 && colIndex < row.length - 1) nearPartMap[rowIndex - 1][colIndex + 1] = true;
            if (rowIndex < map.length - 1 && colIndex < row.length - 1) nearPartMap[rowIndex + 1][colIndex + 1] = true;
          }
        }
      });
    });

    // console.log(nearPartMap.map((row) => row.map((cell) => (cell ? "x" : ".")).join("")).join("\n"));

    const partNumbers: bigint[] = [];

    map.forEach((row, rowIndex) => {
      let number = "";
      let nearPart = false;
      row.forEach((cell, colIndex) => {
        switch (classify(cell)) {
          case "digit": {
            if (number.length === 0) {
              nearPart = nearPartMap[rowIndex][colIndex];
            } else {
              nearPart ||= nearPartMap[rowIndex][colIndex];
            }
            number += cell;
            break;
          }
          default: {
            if (nearPart && number.length > 0) {
              partNumbers.push(BigInt(number));
            }

            number = "";
            break;
          }
        }
      });

      if (nearPart && number.length > 0) {
        partNumbers.push(BigInt(number));
      }
    });

    return partNumbers.reduce((sum, v) => sum + v, 0n);
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map((group) => {
    const map = group.split("\n").map((line) => line.split(""));

    // Preprocess: label cells with the number of parts around them
    const nearbyPartMap: Array<bigint>[][] = map.map((row) => row.map((_cell) => []));
    map.forEach((row, rowIndex) => {
      for (let colIndex = 0; colIndex < row.length; ) {
        switch (classify(map[rowIndex][colIndex])) {
          case "digit": {
            let partNumber = "";
            const startCol = Math.max(0, colIndex - 1);
            while (colIndex < row.length && classify(map[rowIndex][colIndex]) === "digit") {
              partNumber += map[rowIndex][colIndex];
              colIndex++;
            }

            const startRow = Math.max(0, rowIndex - 1);
            const endRow = Math.min(map.length - 1, rowIndex + 1);
            const endCol = Math.min(row.length - 1, colIndex);
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startCol; c <= endCol; c++) {
                nearbyPartMap[r][c].push(BigInt(partNumber));
              }
            }
            break;
          }
          default:
            colIndex++;
            break;
        }
      }
    });

    // console.log(nearbyPartMap.map((row) => row.map((x) => x.length).join("")).join("\n"));

    let value = 0n;

    map.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        switch (classify(cell)) {
          case "gear": {
            const nearbyParts = nearbyPartMap[rowIndex][colIndex];
            if (nearbyParts.length == 2) {
              value += nearbyParts[0] * nearbyParts[1];
            }
            break;
          }
        }
      });
    });

    return value;
  });

  console.log(results);
};

solvePart1();
solvePart2();
