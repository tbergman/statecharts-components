import { Group } from "./types";
import { CarouselMachineFactoryConfig } from "./machine/factory";

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

// Machine will have transitions if the groups are more than 1
export function hasTransition(config: CarouselMachineFactoryConfig) {
  return (
    constructGroups(config.totalItems, config.slidesToShow || 1).length > 1
  );
}

export function isAutoPlayValidNumber(
  autoPlay: CarouselMachineFactoryConfig["autoPlay"]
) {
  return (
    autoPlay !== undefined &&
    !isNaN(autoPlay) &&
    isFinite(autoPlay) &&
    autoPlay > 0
  );
}

// indicate whether we should include autoPlay in machine definition or not
export function hasAutoPlay(config: CarouselMachineFactoryConfig) {
  return (
    config.autoPlay !== undefined &&
    isAutoPlayValidNumber(config.autoPlay) &&
    hasTransition(config)
  );
}

export function isCursorValid(
  nextCursor: number | undefined,
  min: number,
  max: number
) {
  return nextCursor !== undefined && nextCursor <= max && nextCursor >= min;
}
