export function getRange(length: number) {
  const result: number[] = [];
  for (let i = 0; i < length; i++) {
    result.push(i + 1);
  }
  console.log({ result });
  return result;
}
