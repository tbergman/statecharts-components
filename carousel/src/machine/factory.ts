import { HeadlessCarouselProps } from "../types";
import { constructGroups, isAutoPlayValidNumber } from "../utils";
import { defaultConfig } from "./config";
import { binaryCarouselMachine } from "./binaryMachine";
import { unaryCarouselMachine } from "./unaryMachine";
import { ternaryCarouselMachine } from "./ternaryMachine";

export function carouselMachineFactory(config: HeadlessCarouselProps) {
  const settings = {
    ...defaultConfig,
    ...config,
  };
  const { totalItems, startIndex, autoPlay, slidesToShow } = settings;

  // Validate startIndex to be a number in the range of min and amx
  if (startIndex < 1 || startIndex > totalItems) {
    throw Error(
      `invalid property \`startIndex\` on carouselMachine. \`startIndex\` should satisfy (1 <= startIndex <= totalItems)\n\`slidesToShow\` can not be ${slidesToShow} when \`totalItems\` is ${totalItems}`,
    );
  }
  // Validate autoPlay to be a valid number (autoPlay can be number | undefined. we just validate the number part here)
  if (autoPlay !== undefined && !isAutoPlayValidNumber(autoPlay)) {
    throw Error("property `autoPlay` should be a valid, non-zero number");
  }

  /**
   * Machine config
   */

  const groups = constructGroups({ totalItems, slidesToShow, startIndex });

  switch (groups.length) {
    // carousel has 1 item to show
    case 1:
      return unaryCarouselMachine();
    // carousel has 2 items to show
    case 2:
      return binaryCarouselMachine(settings);
    // carousel has more than 2 items to show
    default:
      return ternaryCarouselMachine(settings);
  }
}
