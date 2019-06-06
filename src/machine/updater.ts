import { CarouselContext, CarouselEvent } from "../types";
import { assign } from "xstate";

export const changeCursor = (
  updater: (ctx: CarouselContext, e: CarouselEvent) => number
) => {
  return assign<CarouselContext, CarouselEvent>({
    cursor: (ctx, e) => updater(ctx, e),
    max: ctx => ctx.max,
    min: ctx => ctx.min,
    dir: ctx => ctx.dir,
    infinite: ctx => ctx.infinite
  });
};
