import { CarouselMachineFactoryConfig } from "./factory";
import {
  Dir,
  CarouselContext,
  CarouselStateSchema,
  CarouselEvent,
  Group
} from "../types";
import {
  constructGroups,
  isCursorValid,
  indexInGroup,
  hasAutoPlay,
  getArrayFirstAndLast
} from "../utils";
import { Machine } from "xstate";
import { changeCursor } from "./updater";

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
    slidesToScroll
  } = config;
  const groups = constructGroups(totalItems, slidesToShow);

  const groupFirstLast = getArrayFirstAndLast(groups);
  const firstGroup = groupFirstLast.first;
  const lastGroup = groupFirstLast.last;

  let initial: any;
  let initialContext: CarouselContext = {
    startCursor: startIndex,
    endCursor: startIndex + slidesToShow,
    min: 1,
    max: totalItems,
    dir,
    infinite,
    slidesToShow,
    slidesToScroll,
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
  const firstNext = [
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the beginning
        ctx.infinite === false && ctx.dir === "rtl",
      actions: [
        changeCursor(ctx => ({
          start: firstGroup.start,
          end: firstGroup.end
        }))
      ]
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the end when start is at least at lastGroup's start
        (ctx.dir === "ltr" &&
          ctx.startCursor + (ctx.slidesToScroll % ctx.max) >=
            lastGroup.start) ||
        (ctx.dir === "rtl" && ctx.infinite === true),
      actions: [
        changeCursor(ctx => ({
          start: lastGroup.start,
          end: lastGroup.end
        }))
      ]
    },
    {
      // Any other case besides above ones will go to middle
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor + (ctx.slidesToScroll % ctx.max),
          end: ctx.endCursor + (ctx.slidesToScroll % ctx.max)
        }))
      ]
    }
  ];
  const firstPrev = [
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        // deadend from the beginning
        ctx.infinite === false && ctx.dir === "ltr",
      actions: [
        changeCursor(ctx => ({
          start: firstGroup.start,
          end: firstGroup.end
        }))
      ]
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the end when start is at least at lastGroup's start
        (ctx.dir === "rtl" &&
          ctx.startCursor + (ctx.slidesToScroll % ctx.max) >=
            lastGroup.start) ||
        (ctx.infinite === true && ctx.dir === "ltr"),
      actions: [
        changeCursor(ctx => ({
          start: lastGroup.start,
          end: lastGroup.end
        }))
      ]
    },
    {
      // Any other case besides above ones will go to middle
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor + (ctx.slidesToScroll % ctx.max),
          end: ctx.endCursor + (ctx.slidesToScroll % ctx.max)
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
      PREV: firstPrev,
      GO_TO: goTo
    }
  };

  const lastNext = [
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the beginning
        ctx.infinite === false && ctx.dir === "ltr",
      actions: [
        changeCursor(ctx => ({
          start: lastGroup.start,
          end: lastGroup.end
        }))
      ]
    },
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the end when start is at least at lastGroup's start
        (ctx.dir === "rtl" &&
          ctx.startCursor + (ctx.slidesToScroll % ctx.max) <=
            firstGroup.start) ||
        (ctx.infinite === true && ctx.dir === "ltr"),
      actions: [
        changeCursor(ctx => ({
          start: firstGroup.start,
          end: firstGroup.end
        }))
      ]
    },
    {
      // Any other case besides above ones will go to middle
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor - (ctx.slidesToScroll % ctx.max),
          end: ctx.endCursor - (ctx.slidesToScroll % ctx.max)
        }))
      ]
    }
  ];
  const lastPrev = [
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        // deadend from the beginning
        ctx.infinite === false && ctx.dir === "rtl",
      actions: [
        changeCursor(ctx => ({
          start: lastGroup.start,
          end: lastGroup.end
        }))
      ]
    },
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        // Hit deadend from the end when start is at least at lastGroup's start
        (ctx.dir === "ltr" &&
          ctx.startCursor - (ctx.slidesToScroll % ctx.max) <=
            firstGroup.start) ||
        (ctx.dir === "rtl" && ctx.infinite === true),
      actions: [
        changeCursor(ctx => ({
          start: firstGroup.start,
          end: firstGroup.end
        }))
      ]
    },
    {
      // Any other case besides above ones will go to middle
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor - (ctx.slidesToScroll % ctx.max),
          end: ctx.endCursor - (ctx.slidesToScroll % ctx.max)
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
      PREV: lastPrev,
      GO_TO: goTo
    }
  };

  const middleNext = [
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "rtl" &&
        ctx.startCursor - (ctx.slidesToScroll % ctx.max) <= firstGroup.start,
      actions: [
        changeCursor(ctx => ({
          // Summing with ctx.max will bring the number back to positive alternative
          start: firstGroup.start,
          end: firstGroup.end
        }))
      ]
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "ltr" &&
        ctx.startCursor + (ctx.slidesToScroll % ctx.max) >= lastGroup.start,
      actions: [
        changeCursor(ctx => ({
          // Summing with ctx.max will bring the number back to positive alternative
          start: lastGroup.start,
          end: lastGroup.end
        }))
      ]
    },
    // Middle -> Middle on LTR
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [
        changeCursor(ctx => ({
          // Summing with ctx.max will bring the number back to positive alternative
          start: ctx.startCursor + (ctx.slidesToScroll % ctx.max),
          end: ctx.endCursor + (ctx.slidesToScroll % ctx.max)
        }))
      ]
    },
    // Middle -> Middle on RTL
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [
        changeCursor(ctx => ({
          // Summing with ctx.max will bring the number back to positive alternative
          start: ctx.startCursor - (ctx.slidesToScroll % ctx.max),
          end: ctx.endCursor - (ctx.slidesToScroll % ctx.max)
        }))
      ]
    }
  ];
  const middlePrev = [
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "ltr" &&
        ctx.startCursor - (ctx.slidesToScroll % ctx.max) <= firstGroup.start,
      actions: [
        changeCursor(ctx => ({
          // Summing with ctx.max will bring the number back to positive alternative
          start: firstGroup.start,
          end: firstGroup.end
        }))
      ]
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "rtl" &&
        ctx.startCursor + (ctx.slidesToScroll % ctx.max) >= lastGroup.start,
      actions: [
        changeCursor(ctx => ({
          // Summing with ctx.max will bring the number back to positive alternative
          start: lastGroup.start,
          end: lastGroup.end
        }))
      ]
    },
    // Middle -> Middle on RTL
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "rtl",
      actions: [
        changeCursor(ctx => ({
          // Summing with ctx.max will bring the number back to positive alternative
          start: ctx.startCursor + (ctx.slidesToScroll % ctx.max),
          end: ctx.endCursor + (ctx.slidesToScroll % ctx.max)
        }))
      ]
    },
    // Middle -> Middle on LTR
    {
      target: "middle",
      cond: (ctx: CarouselContext) => ctx.dir === "ltr",
      actions: [
        changeCursor(ctx => ({
          // Summing with ctx.max will bring the number back to positive alternative
          start: ctx.startCursor - (ctx.slidesToScroll % ctx.max),
          end: ctx.endCursor - (ctx.slidesToScroll % ctx.max)
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

  return Machine<CarouselContext, CarouselStateSchema, CarouselEvent>({
    id: "ternaryCarousel",
    initial,
    context: initialContext,
    states: {
      first,
      middle,
      last
    }
  });
}
