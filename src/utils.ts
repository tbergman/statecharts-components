import { Group } from "./types";

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

export function constructGroups(
  totalItems: number,
  slidesToShow: number
): Group[] {
  let groups = [];
  for (let i = slidesToShow; i <= totalItems; i++) {
    groups.push({ start: i - slidesToShow + 1, end: i });
  }
  return groups;
}

export function indexInGroup(index: number, group: Group) {
  return index <= group.end && index >= group.start;
}
