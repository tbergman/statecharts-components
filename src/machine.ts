import { Machine, EventObject } from "xstate";
import {
  CarouselContext,
  Dir,
  CarouselEvent,
  CarouselStateSchema
} from "./types";
import { guards } from "./machine/guards";
import { changeCursor } from "./machine/updater";

const goTo = [
  {
    target: "first",
    cond: (ctx: CarouselContext, e: CarouselEvent) =>
      guards.isCursorValid(e.data, ctx.min, ctx.max) &&
      guards.isFirstItem(e.data, ctx.min),
    actions: [changeCursor(ctx => ctx.min)]
  },
  {
    target: "last",
    cond: (ctx: CarouselContext, e: CarouselEvent) =>
      guards.isCursorValid(e.data, ctx.min, ctx.max) &&
      guards.isLastItem(e.data, ctx.max),
    actions: [changeCursor(ctx => ctx.max)]
  },
  {
    target: "middle",
    cond: (ctx: CarouselContext, e: CarouselEvent) =>
      guards.isCursorValid(e.data, ctx.min, ctx.max),
    actions: [changeCursor((_, e) => e.data)]
  }
];

function hasAutoPlay(config: CarouselMachineFactoryConfig) {
  // TODO: add `config.totalItems > 1`
  // TODO: autoPlay should not be 0
  return config.autoPlay !== undefined && config.autoPlay > 0;
}

export interface CarouselMachineFactoryConfig {
  totalItems: number;
  startIndex: number;
  autoPlay?: number;
  dir?: Dir;
  infinite?: boolean;
}
export function carouselMachineFactory(config: CarouselMachineFactoryConfig) {
  const {
    totalItems,
    startIndex,
    autoPlay,
    dir = "ltr",
    infinite = false
  } = config;
  if (startIndex < 1 || startIndex > totalItems) {
    throw Error(
      "invalid startIndex on carouselMachine. startIndex should satisfy 1 <= startIndex <= totalItems"
    );
  }
  let initial: any = "first";
  let initialContext: CarouselContext = {
    cursor: startIndex,
    min: 1,
    max: totalItems,
    dir,
    infinite
  };

  // STATE AND STARTINDEX
  if (startIndex === 1) {
    initial = "first";
  } else if (startIndex === totalItems) {
    initial = "last";
  } else {
    initial = "middle";
    initialContext = { ...initialContext, cursor: startIndex };
  }

  /**
   * States
   */

  const firstNext = [
    {
      target: "first",
      cond: (ctx: CarouselContext) => ctx.min === ctx.max
    },
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [changeCursor(ctx => ctx.cursor + 1)]
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "rtl" && ctx.infinite === true,
      actions: [changeCursor(ctx => ctx.max)]
    }
  ];
  const first = {
    ...(hasAutoPlay(config) && {
      after: {
        [autoPlay as number]: firstNext
      }
    }),
    on: {
      NEXT: firstNext,
      PREV: [
        {
          target: "last",
          cond: (ctx: CarouselContext) =>
            ctx.dir === "ltr" && ctx.infinite === true,
          actions: [changeCursor(ctx => ctx.max)]
        },
        {
          target: "middle",
          cond: (ctx: CarouselContext) => ctx.dir === "rtl",
          actions: [changeCursor(ctx => ctx.cursor + 1)]
        }
      ],
      GO_TO: goTo
    }
  };

  const lastNext = [
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "ltr" && ctx.infinite === true,
      actions: [changeCursor(ctx => ctx.min)]
    },
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [changeCursor(ctx => ctx.cursor - 1)]
    }
  ];
  const last = {
    ...(hasAutoPlay(config) && {
      after: {
        [autoPlay as number]: lastNext
      }
    }),
    on: {
      NEXT: lastNext,
      PREV: [
        {
          target: "middle",
          cond: (ctx: CarouselContext) => ctx.dir === "ltr",
          actions: [changeCursor(ctx => ctx.cursor - 1)]
        },
        {
          target: "first",
          cond: (ctx: CarouselContext) =>
            ctx.dir === "rtl" && ctx.infinite === true,
          actions: [changeCursor(ctx => ctx.min)]
        }
      ],
      GO_TO: goTo
    }
  };

  const middleNext = [
    // last item in middle
    {
      target: "last",
      id: "middle-next-last",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "ltr" && ctx.cursor + 1 === ctx.max,
      actions: [changeCursor(ctx => ctx.max)]
    },
    // first item in middle going back becasue of rtl dir
    {
      target: "first",
      id: "middle-next-first",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "rtl" && ctx.cursor - 1 === ctx.min,
      actions: [changeCursor(ctx => ctx.min)]
    },
    // middle to middle in ltr
    {
      target: "middle",
      id: "middle-next-middle-ltr",
      key: "middle-next-middle-ltr",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [changeCursor(ctx => ctx.cursor + 1)]
    },
    // middle to middle in rtl
    {
      target: "middle",
      id: "middle-next-middle-rtl",
      key: "middle-next-middle-rtl",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [changeCursor(ctx => ctx.cursor - 1)]
    }
  ];
  const middlePrev = [
    // last item in middle
    {
      target: "first",
      id: "middle-prev-first",
      key: "middle-prev-first",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "ltr" && ctx.cursor - 1 === ctx.min,
      actions: [changeCursor(ctx => ctx.min)]
    },
    // first item in middle going back becasue of rtl dir
    {
      target: "last",
      id: "middle-prev-last",
      key: "middle-prev-last",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "rtl" && ctx.cursor + 1 === ctx.max,
      actions: [changeCursor(ctx => ctx.max)]
    },
    // middle to middle in ltr
    {
      target: "middle",
      id: "middle-prev-middle-ltr",
      key: "middle-prev-middle-ltr",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [changeCursor(ctx => ctx.cursor - 1)]
    },
    // middle to middle in rtl
    {
      target: "middle",
      id: "middle-prev-middle-rtl",
      key: "middle-prev-middle-rtl",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [changeCursor(ctx => ctx.cursor + 1)]
    }
  ];
  // for middle, both NEXT and PREV can result in same situations depending on item position and dir
  const middle = {
    ...(hasAutoPlay(config) && {
      after: {
        [autoPlay as number]: middleNext
      }
    }),
    on: {
      NEXT: middleNext,
      PREV: middlePrev,
      GO_TO: goTo
    }
  };

  /**
   * Machine config
   */
  const machine = Machine<CarouselContext, CarouselStateSchema, EventObject>({
    id: "carousel",
    initial,
    context: initialContext,
    states: {
      first,
      middle,
      last
    }
  });
  return machine;
}
