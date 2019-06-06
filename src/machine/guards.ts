export const guards = {
  isFirstItem: (nextCursor: number | undefined, min: number) =>
    nextCursor !== undefined && nextCursor === min,
  isLastItem: (nextCursor: number | undefined, max: number) =>
    nextCursor !== undefined && nextCursor === max,
  isCursorValid: (nextCursor: number | undefined, min: number, max: number) => {
    return nextCursor !== undefined && nextCursor <= max && nextCursor >= min;
  }
};
