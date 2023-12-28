import { chunk, minMap } from "../utils/collections.mts";
import { Range } from "../utils/range.mts";

const groups = (
  await Deno.readTextFile(
    new URL("", import.meta.url.replace(".mts", ".in")).pathname
  )
).split("---");

const readMap = (map: string) => {
  return map
    .trim()
    .split("\n")
    .slice(1)
    .map((row) => {
      const [destStart, sourceStart, len] = row
        .trim()
        .split(" ")
        .map((cell) => Number(cell));

      return {
        dest: new Range(destStart, destStart + len - 1),
        source: new Range(sourceStart, sourceStart + len - 1),
      };
    });
};

const readData = (data: string) => {
  const [seedsData, ...mapData] = data.split("\n\n");
  return {
    seeds: seedsData
      .split(": ")[1]
      .split(" ")
      .map((seed) => Number(seed)),

    // Input data orders these, so this array is in order to get us from seed to location
    mappings: mapData.map(readMap),
  };
};

const solvePart1 = () => {
  const results = groups.map(readData).map(({ seeds, mappings }) => {
    return minMap(seeds, (seed) => {
      return mappings.reduce((value, mapping) => {
        const range = mapping.find((range) => range.source.includes(value));
        return range ? range.dest.lo + (value - range.source.lo) : value;
      }, seed);
    });
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map(({ seeds, mappings }) => {
    const startingRanges = chunk(seeds, 2).map(
      ([lo, length]) => new Range(lo, lo + length - 1)
    );
    const mappedRanges = mappings.reduce((ranges, mapping) => {
      const newRanges = [];
      while (ranges.length > 0) {
        const range = ranges.pop()!;
        const overlapping = mapping.find((mappingRange) =>
          range.overlaps(mappingRange.source)
        );
        if (overlapping) {
          const [overlappingRange, nonOverlappingRanges] =
            overlapping.source.partition(range);

          // Need to remap the bit that did overlap to the destination
          if (overlappingRange) {
            const offset = overlappingRange.lo - overlapping.source.lo;
            newRanges.push(
              Range.span(overlapping.dest.lo + offset, overlappingRange.length)
            );
          }

          // May overlap with another range in this mapping
          ranges.push(...nonOverlappingRanges);
        } else {
          newRanges.push(range);
        }
      }

      return newRanges;
    }, startingRanges);

    return minMap(mappedRanges, (range) => range.lo) ?? 0;
  });

  console.log(results);
};

solvePart1();
solvePart2();
