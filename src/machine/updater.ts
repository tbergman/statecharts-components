import { CarouselContext, CarouselEvent, Group } from "../types";
import { assign } from "xstate";

export const changeCursor = (
  updater: (ctx: CarouselContext, e: CarouselEvent) => Group
) => {
  return assign<CarouselContext, CarouselEvent>({
    startCursor: (ctx, e) => updater(ctx, e).start,
    endCursor: (ctx, e) => updater(ctx, e).end,
    max: ctx => ctx.max,
    min: ctx => ctx.min,
    dir: ctx => ctx.dir,
    infinite: ctx => ctx.infinite,
    groups: ctx => ctx.groups
  });
};
