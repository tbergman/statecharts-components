import { Group, CarouselType, HeadlessCarouselProps } from "./types";

export function getRange(length: number) {
  return makeNumeralSequence(1, length);
}

export function makeNumeralSequence(start: number, end: number) {
  let sequence = [];
  for (let i = start; i <= end; i++) {
    sequence.push(i);
  }
  return sequence;
}

/**
 * An array of all possible groups
 */

export function constructGroups({
  totalItems,
  slidesToShow = 1,
  startIndex = 1,
}: {
  totalItems: number;
  slidesToShow?: number;
  startIndex?: number;
}): Group[] {
  try {
    const type = getCarouselType(totalItems, slidesToShow);

    switch (type) {
      case "Unary":
        // we don't need to rotate a single element array
        return [makeNumeralSequence(1, totalItems)];
      case "Binary":
        return rotateArrayLeft(
          [
            makeNumeralSequence(1, slidesToShow),
            makeNumeralSequence(2, totalItems),
          ],
          startIndex - 1,
        );
      case "Ternary":
      default:
        let groups = [];

        for (let i = slidesToShow; i <= totalItems; i++) {
          groups.push(makeNumeralSequence(i - slidesToShow + 1, i));
        }

        // Since startIndex starts from 1, ...
        return rotateArrayLeft(groups, startIndex - 1);
    }
  } catch (err) {
    throw err;
  }
}

function rotateArrayLeft<T>(array: T[], offset: number): T[] {
  const beforeOffset = array.slice(0, offset);
  const afterOffset = array.slice(offset);
  return afterOffset.concat(beforeOffset);
}

export function indexInGroup(index: number, group: Group) {
  return group.includes(index);
}

// Machine will have transitions if the groups are more than 1
export function hasTransition(config: HeadlessCarouselProps) {
  return (
    constructGroups({
      totalItems: config.totalItems,
      slidesToShow: config.slidesToShow || 1,
      startIndex: config.startIndex || 1,
    }).length > 1
  );
}

export function isAutoPlayValidNumber(
  autoPlay: HeadlessCarouselProps["autoPlay"],
) {
  return (
    autoPlay !== undefined &&
    !isNaN(autoPlay) &&
    isFinite(autoPlay) &&
    autoPlay > 0
  );
}

// indicate whether we should include autoPlay in machine definition or not
export function hasAutoPlay(config: HeadlessCarouselProps) {
  return (
    config.autoPlay !== undefined &&
    isAutoPlayValidNumber(config.autoPlay) &&
    hasTransition(config)
  );
}

export function isInteger(number: unknown) {
  const isValidNumber =
    typeof number === "number" && !isNaN(number) && isFinite(number);
  return !isValidNumber
    ? false
    : !!Number.isInteger
    ? Number.isInteger(number as number)
    : Math.floor(number as number) === number;
}

export function isNumber(num: number) {
  return typeof num === "number" && isFinite(num) && !isNaN(num);
}

export function getCarouselType(
  totalItems: number,
  slidesToShow: number,
): CarouselType {
  const diff = totalItems - slidesToShow;
  if (diff == 0) {
    return "Unary";
  } else if (diff == 1) {
    return "Binary";
  } else if (diff >= 2) {
    return "Ternary";
  } else {
    throw Error("invalid carousel type");
  }
}

export function noop() {}

export function isDelayedEvent(type: string) {
  return type.includes("xstate.after");
}

export function getRandomFromArray<T>(array: T[]) {
  const { length } = array;
  return array[Math.floor(Math.random() * length)];
}

export function isPercentage(perc: string) {
  return perc.trim().endsWith("%");
}

export function parsePercentage(perc: string) {
  if (!isPercentage(perc)) {
    throw Error(`invalid percentage: ${perc}`);
  }

  let parsed = parseFloat(perc);
  if (isNaN(parsed)) {
    throw Error(`invalid percentage: ${perc}`);
  }
  return parsed / 100;
}
