import { Machine, EventObject } from "xstate";
import {
  CarouselContext,
  Dir,
  CarouselEvent,
  CarouselStateSchema,
  Group
} from "./types";
import { changeCursor } from "./machine/updater";
import { constructGroups, indexInGroup } from "./utils";

// e.data is the cursor of the group to which we need to transition
const goTo = [
  {
    target: "first",
    cond: (ctx: CarouselContext, e: CarouselEvent) =>
      isCursorValid(e.data, ctx.min, ctx.max) && e.data === 1,
    actions: [
      changeCursor(ctx => ({
        start: ctx.min,
        end: ctx.min + ctx.slidesToShow - 1
      }))
    ]
  },
  {
    target: "last",
    cond: (ctx: CarouselContext, e: CarouselEvent) =>
      isCursorValid(e.data, ctx.min, ctx.max) && e.data === ctx.groups.length,
    actions: [
      changeCursor(ctx => ({
        start: ctx.max - ctx.slidesToShow + 1,
        end: ctx.max
      }))
    ]
  },
  {
    target: "middle",
    cond: (ctx: CarouselContext, e: CarouselEvent) =>
      isCursorValid(e.data, ctx.min, ctx.max),
    actions: [
      changeCursor((ctx, e) => ({
        start: e.data,
        end: e.data + ctx.slidesToShow - 1
      }))
    ]
  }
];

function hasAutoPlay(config: CarouselMachineFactoryConfig) {
  // TODO: add `config.totalItems > 1`
  // TODO: autoPlay should not be 0
  return config.autoPlay !== undefined && config.autoPlay > 0;
}

function isCursorValid(
  nextCursor: number | undefined,
  min: number,
  max: number
) {
  return nextCursor !== undefined && nextCursor <= max && nextCursor >= min;
}

export interface CarouselMachineFactoryConfig {
  totalItems: number;
  startIndex: number;
  autoPlay?: number;
  dir?: Dir;
  infinite?: boolean;
  slidesToShow?: number;
}
export function carouselMachineFactory(config: CarouselMachineFactoryConfig) {
  const {
    totalItems,
    startIndex,
    autoPlay,
    dir = "ltr",
    infinite = false,
    slidesToShow = 1
  } = config;
  if (startIndex < 1 || startIndex > totalItems) {
    throw Error(
      "invalid startIndex on carouselMachine. startIndex should satisfy 1 <= startIndex <= totalItems"
    );
  }

  const groups = constructGroups(totalItems, slidesToShow);
  const firstGroup = groups[0];
  // TODO: check for invalid cases
  const lastGroup = groups.slice().pop() as Group;

  let initial: any;
  let initialContext: CarouselContext = {
    startCursor: startIndex,
    endCursor: startIndex + slidesToShow,
    min: 1,
    max: totalItems,
    dir,
    infinite,
    slidesToShow,
    groups
  };

  // STATE AND STARTINDEX
  if (indexInGroup(startIndex, firstGroup)) {
    initial = "first";
    initialContext = {
      ...initialContext,
      startCursor: firstGroup.start,
      endCursor: firstGroup.end
    };
  } else if (indexInGroup(startIndex, lastGroup)) {
    initial = "last";
    initialContext = {
      ...initialContext,
      startCursor: lastGroup.start,
      endCursor: lastGroup.end
    };
  } else {
    initial = "middle";
    initialContext = {
      ...initialContext,
      startCursor: startIndex,
      endCursor: startIndex + slidesToShow - 1
    };
  }

  /**
   * States
   */
  // TODO: For now, we assume all carousels have all 3 states. Need to handle unary and binary cases as well.
  const firstNext = [
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor + 1,
          end: ctx.endCursor + 1
        }))
      ]
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "rtl" && ctx.infinite === true,
      actions: [
        changeCursor(ctx => ({
          start: ctx.max - ctx.slidesToShow + 1,
          end: ctx.max
        }))
      ]
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
          actions: [
            changeCursor(ctx => ({
              start: ctx.max - ctx.slidesToShow + 1,
              end: ctx.max
            }))
          ]
        },
        {
          target: "middle",
          cond: (ctx: CarouselContext) => ctx.dir === "rtl",
          actions: [
            changeCursor(ctx => ({
              start: ctx.startCursor + 1,
              end: ctx.endCursor + 1
            }))
          ]
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
      actions: [
        changeCursor(ctx => ({
          start: ctx.min,
          end: ctx.min + ctx.slidesToShow - 1
        }))
      ]
    },
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor - 1,
          end: ctx.endCursor - 1
        }))
      ]
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
          actions: [
            changeCursor(ctx => ({
              start: ctx.startCursor - 1,
              end: ctx.endCursor - 1
            }))
          ]
        },
        {
          target: "first",
          cond: (ctx: CarouselContext) =>
            ctx.dir === "rtl" && ctx.infinite === true,
          actions: [
            changeCursor(ctx => ({
              start: ctx.min,
              end: ctx.min + ctx.slidesToShow - 1
            }))
          ]
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
        ctx.dir === "ltr" && indexInGroup(ctx.startCursor + 1, lastGroup),
      actions: [
        changeCursor(ctx => ({
          start: ctx.max - ctx.slidesToShow + 1,
          end: ctx.max
        }))
      ]
    },
    // first item in middle going back becasue of rtl dir
    {
      target: "first",
      id: "middle-next-first",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "rtl" && ctx.startCursor - 1 === ctx.min,
      actions: [
        changeCursor(ctx => ({
          start: ctx.min,
          end: ctx.min + ctx.slidesToShow - 1
        }))
      ]
    },
    // middle to middle in ltr
    {
      target: "middle",
      id: "middle-next-middle-ltr",
      key: "middle-next-middle-ltr",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor + 1,
          end: ctx.endCursor + 1
        }))
      ]
    },
    // middle to middle in rtl
    {
      target: "middle",
      id: "middle-next-middle-rtl",
      key: "middle-next-middle-rtl",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor - 1,
          end: ctx.endCursor - 1
        }))
      ]
    }
  ];
  const middlePrev = [
    // last item in middle
    {
      target: "first",
      id: "middle-prev-first",
      key: "middle-prev-first",
      cond: (ctx: CarouselContext) =>
        // on Prev of ltr carousel, goes from middle to first, if the next cursor (ctx.startCursor - 1) is the first item
        ctx.dir === "ltr" && ctx.startCursor - 1 === ctx.min,
      actions: [
        changeCursor(ctx => ({
          start: ctx.min,
          end: ctx.min + ctx.slidesToShow - 1
        }))
      ]
    },
    // first item in middle going back becasue of rtl dir
    {
      target: "last",
      id: "middle-prev-last",
      key: "middle-prev-last",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "rtl" && indexInGroup(ctx.startCursor + 1, lastGroup),
      actions: [
        changeCursor(ctx => ({
          start: ctx.max - ctx.slidesToShow + 1,
          end: ctx.max
        }))
      ]
    },
    // middle to middle in ltr
    {
      target: "middle",
      id: "middle-prev-middle-ltr",
      key: "middle-prev-middle-ltr",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor - 1,
          end: ctx.endCursor - 1
        }))
      ]
    },
    // middle to middle in rtl
    {
      target: "middle",
      id: "middle-prev-middle-rtl",
      key: "middle-prev-middle-rtl",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor + 1,
          end: ctx.endCursor + 1
        }))
      ]
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
