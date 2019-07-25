import {
  CarouselContext,
  UnaryCarouselStateSchema,
  CarouselEvent,
  HeadlessCarouselProps,
} from "../types";

import { Machine } from "xstate";
import { constructGroups } from "../utils";

export function unaryCarouselMachine(config: HeadlessCarouselProps) {
  const { startIndex, slidesToShow, totalItems, dir, infinite } = config;
  const groups = constructGroups({ totalItems, slidesToShow, startIndex });
  return Machine<CarouselContext, UnaryCarouselStateSchema, CarouselEvent>({
    id: "unaryCarousel",
    initial: "running",
    context: {
      cursor: 1,
      min: 1,
      max: totalItems,
      dir,
      infinite,
      slidesToShow,
      groups,
    },
    states: {
      running: {},
    },
  });
}
