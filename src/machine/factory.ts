import { Dir } from "../types";
import { constructGroups, isAutoPlayValidNumber } from "../utils";
import { defaultConfig } from "./config";
import { binaryCarouselMachine } from "./binaryMachine";
import { unaryCarouselMachine } from "./unaryMachine";
import { ternaryCarouselMachine } from "./ternaryMachine";

export interface CarouselMachineFactoryConfig {
  totalItems: number;
  startIndex: number;
  autoPlay?: number;
  dir: Dir;
  infinite: boolean;
  slidesToShow: number;
  slidesToScroll: number;
}

export function carouselMachineFactory(config: CarouselMachineFactoryConfig) {
  const settings = {
    ...defaultConfig,
    ...config
  };
  const {
    totalItems,
    startIndex,
    autoPlay,
    slidesToShow,
    slidesToScroll
  } = settings;

  // Validate startIndex to be a number in the range of min and amx
  if (startIndex < 1 || startIndex > totalItems) {
    throw Error(
      `invalid property \`startIndex\` on carouselMachine. \`startIndex\` should satisfy (1 <= startIndex <= totalItems)\n\`slidesToShow\` can not be ${slidesToShow} when \`totalItems\` is ${totalItems}`
    );
  }
  // Validate autoPlay to be a valid number (autoPlay can be number | undefined. we just validate the number part here)
  if (autoPlay !== undefined && !isAutoPlayValidNumber(autoPlay)) {
    throw Error("property `autoPlay` should be a valid, non-zero number");
  }
  // Validate slidesToShow to be a number in the range of min and max
  if (slidesToShow < 1 || slidesToShow > totalItems) {
    throw Error(
      `invalid property \`slidesToShow\` on carouselMachine. \`slidesToShow\` should satisfy (1 <= slidesToShow <= totalItems)\n\`slidesToShow\` can not be ${slidesToShow} when \`totalItems\` is ${totalItems}`
    );
  }

  /**
   * Machine config
   */

  const groups = constructGroups(totalItems, slidesToShow);

  switch (groups.length) {
    // unary carousel
    case 1:
      return unaryCarouselMachine(settings);
    // binary carousel
    case 2:
      return binaryCarouselMachine(settings);
    // carousel has >1 item
    default:
      return ternaryCarouselMachine(settings);
  }
}
