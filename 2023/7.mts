import { countBy, maxBy, sortBy, sumOf } from "../utils/collections.mts";

const groups = (
  await Deno.readTextFile(
    new URL("", import.meta.url.replace(".mts", ".in")).pathname
  )
).split("\n\n");

// A lot of duplication in this solution, but no need to generalize!

const CARD_STRENGTHS = {
  "2": 0,
  "3": 1,
  "4": 2,
  "5": 3,
  "6": 4,
  "7": 5,
  "8": 6,
  "9": 7,
  T: 8,
  J: 9,
  Q: 10,
  K: 11,
  A: 12,
};

const CARD_STRENGTHS2 = {
  J: 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  "7": 6,
  "8": 7,
  "9": 8,
  T: 9,
  Q: 10,
  K: 11,
  A: 12,
};

type Tuple5<T> = [T, T, T, T, T];
type Bid = { hand: Tuple5<keyof typeof CARD_STRENGTHS>; amount: bigint };
type BidWithReplaced = Bid & { newHand: Bid["hand"] };

const readData = (data: string): Bid[] => {
  return data.split("\n").map((line) => {
    const [hand, bid] = line.split(" ");
    return {
      hand: hand.split("") as Tuple5<keyof typeof CARD_STRENGTHS>,
      amount: BigInt(bid),
    };
  });
};

const handStrength = (hand: Bid["hand"]) => {
  const counts = Array.from(countBy(hand, (v) => v).values())
    .sort()
    .reverse();

  switch (counts.length) {
    case 1: // five of a kind
      return 7;
    case 2: // four of a kind or full house
      return counts[0] === 4 ? 6 : 5;
    case 3: // three of a kind or two pair
      return counts[0] === 3 ? 4 : 3;
    case 4: // one pair
      return 2;
    default: // high card
      return 1;
  }
};

const compareHands = (a: Bid, b: Bid) => {
  const aStrength = handStrength(a.hand);
  const bStrength = handStrength(b.hand);
  if (aStrength !== bStrength) {
    return aStrength - bStrength;
  }

  return (
    CARD_STRENGTHS[a.hand[0]] - CARD_STRENGTHS[b.hand[0]] ||
    CARD_STRENGTHS[a.hand[1]] - CARD_STRENGTHS[b.hand[1]] ||
    CARD_STRENGTHS[a.hand[2]] - CARD_STRENGTHS[b.hand[2]] ||
    CARD_STRENGTHS[a.hand[3]] - CARD_STRENGTHS[b.hand[3]] ||
    CARD_STRENGTHS[a.hand[4]] - CARD_STRENGTHS[b.hand[4]]
  );
};

const compareHands2 = (a: BidWithReplaced, b: BidWithReplaced) => {
  const aStrength = handStrength(a.newHand);
  const bStrength = handStrength(b.newHand);
  if (aStrength !== bStrength) {
    return aStrength - bStrength;
  }

  return (
    CARD_STRENGTHS2[a.hand[0]] - CARD_STRENGTHS2[b.hand[0]] ||
    CARD_STRENGTHS2[a.hand[1]] - CARD_STRENGTHS2[b.hand[1]] ||
    CARD_STRENGTHS2[a.hand[2]] - CARD_STRENGTHS2[b.hand[2]] ||
    CARD_STRENGTHS2[a.hand[3]] - CARD_STRENGTHS2[b.hand[3]] ||
    CARD_STRENGTHS2[a.hand[4]] - CARD_STRENGTHS2[b.hand[4]]
  );
};

const jokerReplacement = (
  hand: Bid["hand"]
): keyof typeof CARD_STRENGTHS2 | null => {
  const jokerIndex = hand.indexOf("J");
  if (jokerIndex == -1) {
    return null;
  }

  const counts = sortBy(
    Array.from(countBy(hand, (v) => v).entries()),
    (v) => 20 * v[1] + CARD_STRENGTHS2[v[0]]
  ).reverse();

  const highest = maxBy(hand, (c) => CARD_STRENGTHS2[c])!;

  const c = counts[0][0];
  switch (counts.length) {
    case 1: // five of a kind
      return "A"; // jokerIndex == -1 check above means this HAS to be a joker
    case 2: // four of a kind (make five of a kind)
      return c == "J" ? counts[1][0] : c;
    case 3: {
      // three of a kind (make four of a kind) or full house (make five of a kind)
      const isFullHouse = counts[1][1] == 2;
      if (isFullHouse) {
        return c == "J" ? counts[1][0] : c;
      }
      return c == "J" ? highest : c;
    }
    case 4: // one pair or two pair (make three of a kind)
      if (counts[1][1] == 2) {
        // two pairs, find highest
        if (c == "J") {
          return counts[1][0];
        } else if (counts[1][0] == "J") {
          return c;
        } else {
          return CARD_STRENGTHS2[c] > CARD_STRENGTHS2[counts[1][0]]
            ? c
            : counts[1][0];
        }
      }
      return c == "J" ? highest : c;
    default: {
      // high card, make a pair
      return highest;
    }
  }
};

const solvePart1 = () => {
  const results = groups.map(readData).map((bids) => {
    bids.sort(compareHands);
    return sumOf(bids, (hand, index) => BigInt(index + 1) * hand.amount);
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((bids) => {
    const bestHands = bids.map(({ hand, amount }) => {
      const replacement = jokerReplacement(hand);
      return {
        hand,
        newHand: replacement
          ? (hand.map((v) => (v == "J" ? replacement : v)) as Tuple5<
              keyof typeof CARD_STRENGTHS2
            >)
          : hand,
        amount,
      };
    });
    bestHands.sort(compareHands2);
    return sumOf(bestHands, ({ amount }, index) => BigInt(index + 1) * amount);
  });

  console.log(results);
};

solvePart1();
solvePart2();
