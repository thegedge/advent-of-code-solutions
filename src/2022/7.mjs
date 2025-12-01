import { sum } from "lodash-es";
import fs from "node:fs/promises";
import path from "node:path";

const processCommand = ([pwd, fs], group) => {
  const [commandLine, ...output] = group.split("\n");
  if (commandLine != "") {
    const [command, arg] = commandLine.split(" ");
    if (command == "cd") {
      pwd = path.normalize(path.join(pwd, arg));
    } else {
      for (const line of output) {
        const [size, file] = line.split(" ");
        if (size != "dir") {
          fs[path.join(pwd, file)] = Number(size);
        }
      }
    }
  }
  return [pwd, fs];
};

const buildFs = (commands) => commands.reduce((fs, c) => processCommand(fs, c.trim()), ["/", {}])[1];

const pathComponents = (pathname) => {
  const dir = path.dirname(pathname);
  if (dir == "/") {
    return ["/"];
  }

  return dir
    .substring(1)
    .split("/")
    .reduce((arr, piece) => [path.join(arr[0], piece), ...arr], ["/"]);
};

const computeSizes = (fs) => {
  return Object.entries(fs).reduce((sizes, [path, size]) => {
    pathComponents(path).forEach((p) => (sizes[p] = (sizes[p] ?? 0) + size));
    return sizes;
  }, {});
};

const data = await fs.readFile("./7.in", "utf8");

// Part 1
console.log(
  data.split("---\n").map((group) => {
    const fs = buildFs(group.split(/\n?\$ /m));
    const sizes = computeSizes(fs);
    return sum(Object.values(sizes).filter((v) => v <= 100000));
  })
);

// Part 2
console.log(
  data.split("---\n").map((group) => {
    const fs = buildFs(group.split(/\n?\$ /m));
    const sizes = computeSizes(fs);
    const toFree = sizes["/"] - 40000000;
    return Object.values(sizes)
      .sort((a, b) => a - b)
      .find((v) => v >= toFree);
  })
);
