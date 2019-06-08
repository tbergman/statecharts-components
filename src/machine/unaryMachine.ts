import {
  Dir,
  CarouselContext,
  UnaryCarouselStateSchema,
  CarouselEvent
} from "../types";
import { CarouselMachineFactoryConfig } from "./factory";
import { Machine } from "xstate";
import { constructGroups } from "../utils";

interface UnaryConfig extends CarouselMachineFactoryConfig {
  dir: Dir;
  infinite: boolean;
  slidesToShow: number;
}
export function unaryCarouselMachine(config: UnaryConfig) {
  const { startIndex, slidesToShow, totalItems, dir, infinite } = config;
  const groups = constructGroups(totalItems, slidesToShow);
  return Machine<CarouselContext, UnaryCarouselStateSchema, CarouselEvent>({
    id: "unaryCarousel",
    initial: "running",
    context: {
      startCursor: startIndex,
      endCursor: startIndex + slidesToShow,
      min: 1,
      max: totalItems,
      dir,
      infinite,
      slidesToShow,
      groups
    },
    states: {
      running: {}
    }
  });
}
