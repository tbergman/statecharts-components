import { Group, CarouselType, HeadlessCarouselProps } from "./types";

export function getRange(length: number) {
  const result: number[] = [];
  for (let i = 0; i < length; i++) {
    result.push(i + 1);
  }
  return result;
}

/**
 * An array of all possible groups
 * @example
 * // constructGroups(5, 3);
 * // [{start: 1, end: 4}, {start: 2, end: 5}, {start: 3, end: 6}]
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
        return [
          {
            start: 1,
            end: totalItems,
          },
        ];
      case "Binary":
        return rotateArrayLeft<Group>(
          [
            {
              start: 1,
              end: slidesToShow,
            },
            {
              start: 2,
              end: totalItems,
            },
          ],
          startIndex - 1,
        );
      case "Ternary":
      default:
        let groups: Group[] = [];

        for (let i = slidesToShow; i <= totalItems; i++) {
          groups.push({
            start: i - slidesToShow + 1,
            end: i,
          });
        }

        // Since startIndex starts from 1, ...
        return rotateArrayLeft<Group>(groups, startIndex - 1);
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
  return index <= group.end && index >= group.start;
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

export function isCursorValid(
  nextCursor: number | undefined,
  min: number,
  max: number,
) {
  return nextCursor !== undefined && nextCursor <= max && nextCursor >= min;
}

export function isNumber(num: number) {
  return typeof num === "number" && isFinite(num) && !isNaN(num);
}

export function isEven(number: number) {
  return isNumber(number) && number % 2 === 0;
}

export function isOdd(number: number) {
  return isNumber(number) && number % 2 !== 0;
}

export function getArrayFirstAndLast<T>(array: Array<T>) {
  const len = array.length;
  const first = array[0];
  const last = array[len - 1];
  return { first, last };
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
