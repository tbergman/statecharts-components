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
const goTo = [
  {
    target: "first",
    cond: "cursorValid&firstGroup",
    actions: ["setCursorToFirstGroup"],
  },
  {
    target: "last",
    cond: "cursorValid&lastGroup",
    actions: ["setCursorToLastGroup"],
  },
  {
    target: "middle",
    cond: "cursorValid",
    actions: ["setCursorToData"],
  },
];

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
      cond: "finite&RTL",
      actions: ["setCursorToFirstGroup"],
    },
    {
      target: "last",
      cond: "LTR&beforeLast||RTL&infinite",
      actions: ["setCursorToLastGroup"],
    },
    {
      target: "middle",
      cond: "LTR",
      actions: ["incrementCursor"],
    },
  ];
  const firstPrev = [
    {
      target: "first",
      cond: "finite&LTR",
      actions: ["setCursorToFirstGroup"],
    },
    {
      target: "last",
      cond: "RTL&beforeLast||infinite&LTR",
      actions: ["setCursorToLastGroup"],
    },
    {
      target: "middle",
      cond: "RTL",
      actions: ["incrementCursor"],
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
      GO_TO: goTo,
    },
  };

  const lastNext = [
    {
      target: "last",
      cond: "finite&LTR",
      actions: ["setCursorToLastGroup"],
    },
    {
      target: "first",
      cond: "RTL&beforeFirst||infinite&LTR",
      actions: ["setCursorToFirstGroup"],
    },
    {
      target: "middle",
      cond: "RTL",
      actions: ["decrementCursor"],
    },
  ];
  const lastPrev = [
    {
      target: "last",
      cond: "finite&RTL",
      actions: ["setCursorToLastGroup"],
    },
    {
      target: "first",
      cond: "LTR&beforeFirst||RTL&infinite",
      actions: ["setCursorToFirstGroup"],
    },
    {
      target: "middle",
      cond: "LTR",
      actions: ["decrementCursor"],
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
      GO_TO: goTo,
    },
  };

  const middleNext = [
    {
      target: "first",
      cond: "RTL&beforeFirst",
      actions: ["setCursorToFirstGroup"],
    },
    {
      target: "last",
      cond: "LTR&beforeLast",
      actions: ["setCursorToLastGroup"],
    },
    // Middle -> Middle on LTR
    {
      target: "middle",
      cond: "LTR",
      actions: ["incrementCursor"],
    },
    // Middle -> Middle on RTL
    {
      target: "middle",
      cond: "RTL",
      actions: ["decrementCursor"],
    },
  ];
  const middlePrev = [
    {
      target: "first",
      cond: "LTR&beforeFirst",
      actions: ["setCursorToFirstGroup"],
    },
    {
      target: "last",
      cond: "RTL&beforeLast",
      actions: ["setCursorToLastGroup"],
    },
    // Middle -> Middle on RTL
    {
      target: "middle",
      cond: "RTL",
      actions: ["incrementCursor"],
    },
    // Middle -> Middle on LTR
    {
      target: "middle",
      cond: "LTR",
      actions: ["decrementCursor"],
    },
  ];
  const middle = {
    ...(hasAutoPlay(config) && {
      after: {
        [autoPlay as number]: middleNext,
      },
    }),
    on: {
      NEXT: middleNext,
      PREV: middlePrev,
      GO_TO: goTo,
    },
  };

  return Machine<CarouselContext, CarouselStateSchema, CarouselEvent>(
    {
      id: "ternaryCarousel",
      initial,
      context: initialContext,
      states: {
        first,
        middle,
        last,
      },
    },
    {
      actions: {
        setCursorToFirstGroup: changeCursor(() => 1),
        setCursorToLastGroup: changeCursor(ctx => ctx.groups.length),
        setCursorToData: changeCursor((ctx, e) => e.data),
        incrementCursor: changeCursor(ctx => ctx.cursor + 1),
        decrementCursor: changeCursor(ctx => ctx.cursor - 1),
      },
      guards: {
        "finite&RTL": ctx => ctx.infinite === false && ctx.dir === "rtl",
        "LTR&beforeLast||RTL&infinite": ctx =>
          (ctx.dir === "ltr" && ctx.cursor + 1 == ctx.groups.length) ||
          (ctx.dir === "rtl" && ctx.infinite === true),
        LTR: ctx => ctx.dir === "ltr",
        "finite&LTR": ctx => ctx.infinite === false && ctx.dir === "ltr",
        "RTL&beforeLast||infinite&LTR": ctx =>
          (ctx.dir === "rtl" && ctx.cursor + 1 == ctx.groups.length) ||
          (ctx.infinite === true && ctx.dir === "ltr"),
        RTL: ctx => ctx.dir === "rtl",
        "RTL&beforeFirst||infinite&LTR": ctx =>
          (ctx.dir === "rtl" && ctx.cursor + 1 == 1) ||
          (ctx.infinite === true && ctx.dir === "ltr"),
        "LTR&beforeFirst||RTL&infinite": ctx =>
          (ctx.dir === "ltr" && ctx.cursor - 1 == 1) ||
          (ctx.dir === "rtl" && ctx.infinite === true),
        "RTL&beforeFirst": ctx => ctx.dir === "rtl" && ctx.cursor - 1 == 1,
        "LTR&beforeLast": ctx =>
          ctx.dir === "ltr" && ctx.cursor + 1 == ctx.groups.length,
        "LTR&beforeFirst": ctx => ctx.dir === "ltr" && ctx.cursor - 1 == 1,
        "RTL&beforeLast": ctx =>
          ctx.dir === "rtl" && ctx.cursor + 1 == ctx.groups.length,
        "cursorValid&firstGroup": (ctx, e) =>
          isCursorValid(e.data, ctx.min, ctx.max) && e.data === 1,
        "cursorValid&lastGroup": (ctx, e) =>
          isCursorValid(e.data, ctx.min, ctx.max) &&
          e.data === ctx.groups.length,
        cursorValid: (ctx, e) => isCursorValid(e.data, ctx.min, ctx.max),
      },
    },
  );
}
