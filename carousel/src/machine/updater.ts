import { CarouselContext, CarouselEvent, Group } from "../types";
import { assign } from "xstate";

export const changeCursor = (
  updater: (ctx: CarouselContext, e: CarouselEvent) => number,
) => {
  return assign<CarouselContext, CarouselEvent>({
    cursor: updater,
    max: ctx => ctx.max,
    min: ctx => ctx.min,
    dir: ctx => ctx.dir,
    infinite: ctx => ctx.infinite,
    groups: ctx => ctx.groups,
  });
};
