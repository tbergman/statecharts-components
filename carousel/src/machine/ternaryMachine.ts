import { CarouselMachineFactoryConfig } from "./factory";
import {
  Dir,
  CarouselContext,
  CarouselStateSchema,
  CarouselEvent,
  Group,
} from "../types";
import {
  constructGroups,
  isCursorValid,
  indexInGroup,
  hasAutoPlay,
  getArrayFirstAndLast,
} from "../utils";
import { Machine } from "xstate";
import { changeCursor } from "./updater";

// e.data is the cursor of the group to which we need to transition
function goTo({
  firstGroup,
  lastGroup,
}: {
  firstGroup: Group;
  lastGroup: Group;
}) {
  // e.data is group cursor
  return [
    {
      target: "first",
      cond: (ctx: CarouselContext, e: CarouselEvent) =>
        isCursorValid(e.data, ctx.min, ctx.max) && e.data === 1,
      actions: [changeCursor(ctx => 1)],
    },
    {
      target: "last",
      cond: (ctx: CarouselContext, e: CarouselEvent) =>
        isCursorValid(e.data, ctx.min, ctx.max) && e.data === ctx.groups.length,
      actions: [changeCursor(ctx => ctx.groups.length)],
    },
    {
      target: "middle",
      cond: (ctx: CarouselContext, e: CarouselEvent) =>
        isCursorValid(e.data, ctx.min, ctx.max),
      actions: [changeCursor((ctx, e) => e.data)],
    },
  ];
}

interface TernaryConfig extends CarouselMachineFactoryConfig {
  dir: Dir;
  infinite: boolean;
  slidesToShow: number;
}
export function ternaryCarouselMachine(config: TernaryConfig) {
  const {
    startIndex,
    slidesToShow,
    totalItems,
    dir,
    infinite,
    autoPlay,
  } = config;
  const groups = constructGroups({ totalItems, slidesToShow, startIndex });

  const groupFirstLast = getArrayFirstAndLast(groups);
  const firstGroup = groupFirstLast.first;
  const lastGroup = groupFirstLast.last;
  const lastGroupIndex = groups.length;

  let initial: any;
  let initialContext: CarouselContext = {
    cursor: startIndex,
    min: 1,
    max: totalItems,
    dir,
    infinite,
    slidesToShow,
    groups,
  };

  // STATE AND STARTINDEX
  if (indexInGroup(startIndex, firstGroup)) {
    initial = "first";
    initialContext = {
      ...initialContext,
      cursor: 1,
    };
  } else if (indexInGroup(startIndex, lastGroup)) {
    initial = "last";
    initialContext = {
      ...initialContext,
      cursor: totalItems,
    };
  } else {
    initial = "middle";
    initialContext = {
      ...initialContext,
      cursor: startIndex,
    };
  }

  /**
   * States
   */
  const firstNext = [
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the beginning
        ctx.infinite === false && ctx.dir === "rtl",
      actions: [changeCursor(ctx => 1)],
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the end when start is at least at lastGroup's start
        (ctx.dir === "ltr" && ctx.cursor + 1 == lastGroupIndex) ||
        (ctx.dir === "rtl" && ctx.infinite === true),
      actions: [changeCursor(ctx => lastGroupIndex)],
    },
    {
      // Any other case besides above ones will go to middle
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [changeCursor(ctx => ctx.cursor + 1)],
    },
  ];
  const firstPrev = [
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        // deadend from the beginning
        ctx.infinite === false && ctx.dir === "ltr",
      actions: [changeCursor(ctx => 1)],
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the end when start is at least at lastGroup's start
        (ctx.dir === "rtl" && ctx.cursor + 1 == lastGroupIndex) ||
        (ctx.infinite === true && ctx.dir === "ltr"),
      actions: [changeCursor(ctx => lastGroupIndex)],
    },
    {
      // Any other case besides above ones will go to middle
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [changeCursor(ctx => ctx.cursor + 1)],
    },
  ];
  const first = {
    ...(hasAutoPlay(config) && {
      after: {
        [autoPlay as number]: firstNext,
      },
    }),
    on: {
      NEXT: firstNext,
      PREV: firstPrev,
      GO_TO: goTo({ firstGroup, lastGroup }),
    },
  };

  const lastNext = [
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the beginning
        ctx.infinite === false && ctx.dir === "ltr",
      actions: [changeCursor(ctx => lastGroupIndex)],
    },
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the end when start is at least at lastGroup's start
        (ctx.dir === "rtl" && ctx.cursor + 1 == 1) ||
        (ctx.infinite === true && ctx.dir === "ltr"),
      actions: [changeCursor(ctx => 1)],
    },
    {
      // Any other case besides above ones will go to middle
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [changeCursor(ctx => ctx.cursor - 1)],
    },
  ];
  const lastPrev = [
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        // deadend from the beginning
        ctx.infinite === false && ctx.dir === "rtl",
      actions: [changeCursor(ctx => lastGroupIndex)],
    },
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the end when start is at least at lastGroup's start
        (ctx.dir === "ltr" && ctx.cursor - 1 == 1) ||
        (ctx.dir === "rtl" && ctx.infinite === true),
      actions: [changeCursor(ctx => 1)],
    },
    {
      // Any other case besides above ones will go to middle
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [changeCursor(ctx => ctx.cursor - 1)],
    },
  ];
  const last = {
    ...(hasAutoPlay(config) && {
      after: {
        [autoPlay as number]: lastNext,
      },
    }),
    on: {
      NEXT: lastNext,
      PREV: lastPrev,
      GO_TO: goTo({ firstGroup, lastGroup }),
    },
  };

  const middleNext = [
    {
      target: "first",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl" && ctx.cursor - 1 == 1,
      actions: [changeCursor(ctx => 1)],
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "ltr" && ctx.cursor + 1 == lastGroupIndex,
      actions: [changeCursor(ctx => lastGroupIndex)],
    },
    // Middle -> Middle on LTR
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [changeCursor(ctx => ctx.cursor + 1)],
    },
    // Middle -> Middle on RTL
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [changeCursor(ctx => ctx.cursor - 1)],
    },
  ];
  const middlePrev = [
    {
      target: "first",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr" && ctx.cursor - 1 == 1,
      actions: [changeCursor(ctx => 1)],
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "rtl" && ctx.cursor + 1 == lastGroupIndex,
      actions: [changeCursor(ctx => lastGroupIndex)],
    },
    // Middle -> Middle on RTL
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [changeCursor(ctx => ctx.cursor + 1)],
    },
    // Middle -> Middle on LTR
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [changeCursor(ctx => ctx.cursor - 1)],
    },
  ];
  // for middle, both NEXT and PREV can result in same situations depending on item position and dir
  const middle = {
    ...(hasAutoPlay(config) && {
      after: {
        [autoPlay as number]: middleNext,
      },
    }),
    on: {
      NEXT: middleNext,
      PREV: middlePrev,
      GO_TO: goTo({ firstGroup, lastGroup }),
    },
  };

  return Machine<CarouselContext, CarouselStateSchema, CarouselEvent>({
    id: "ternaryCarousel",
    initial,
    context: initialContext,
    states: {
      first,
      middle,
      last,
    },
  });
}
