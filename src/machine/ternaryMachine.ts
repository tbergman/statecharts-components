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
        // LTR & RTL & infinite === true: First -> First , scroll distance is divisable by totalItems
        (ctx.infinite === true && ctx.slidesToScroll % ctx.max === 0) ||
        // RTL & infinite === false: First -> First, when infinite is false, no matter what scrollIndex is, carousel will stay in First
        (ctx.dir === "rtl" && ctx.infinite === false)
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        // LTR & infinite === false: First -> Last, scroll distance is equal to or larger than (totalItems - slidesToShow)
        (ctx.infinite === false &&
          ctx.dir === "ltr" &&
          ctx.slidesToScroll >= ctx.max - ctx.slidesToShow) ||
        // RTL & LTR & infinite === true: First -> Last , scroll distance is (totalItems - 1) + N*totalItems
        (ctx.infinite === true &&
          // Ideally (ctx.slidesToScroll % ctx.max === 0) should be prevented here, but this is prevented in the First -> First section.
          ctx.slidesToScroll % ctx.max <= ctx.slidesToShow),
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
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor + ctx.slidesToScroll,
          end: ctx.endCursor + ctx.slidesToScroll
        }))
      ]
    }
  ];
  const firstPrev = [
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        // LTR & RTL & infinite === true: First -> First , scroll distance is divisable by totalItems
        (ctx.infinite === true && ctx.slidesToScroll % ctx.max === 0) ||
        // RTL & infinite === false: First -> First, when infinite is false, no matter what scrollIndex is, carousel will stay in First
        (ctx.dir === "ltr" && ctx.infinite === false)
    },
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        // LTR & infinite === false: First -> Last, scroll distance is equal to or larger than (totalItems - 1)
        (ctx.infinite === false &&
          ctx.dir === "rtl" &&
          ctx.slidesToScroll >= ctx.max - ctx.slidesToShow) ||
        // RTL & LTR & infinite === true: First -> Last , scroll distance is (totalItems - 1) + N*totalItems
        (ctx.infinite === true &&
          ctx.slidesToScroll % ctx.max <= ctx.slidesToShow),
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
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor + ctx.slidesToScroll,
          end: ctx.endCursor + ctx.slidesToScroll
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
        // LTR & RTL & infinite === true: Last -> Last , scroll distance is divisable by totalItems
        (ctx.infinite === true && ctx.slidesToScroll % ctx.max === 0) ||
        // LTR & infinite === false: Last -> Last, when infinite is false, no matter what scrollIndex is, carousel will stay in First
        (ctx.dir === "ltr" && ctx.infinite === false)
    },
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        // RTL & infinite === false: Last -> First, scroll distance is equal to or larger than (totalItems - 1)
        (ctx.infinite === false &&
          ctx.dir === "rtl" &&
          ctx.slidesToScroll >= ctx.max - ctx.slidesToShow) ||
        // RTL && RTL & infinite === true: Last -> First , scroll distance is (totalItems - 1) + N*totalItems
        (ctx.infinite === true &&
          ctx.dir === "rtl" &&
          ctx.slidesToScroll % ctx.max <= ctx.slidesToShow),
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
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor - ctx.slidesToScroll,
          end: ctx.endCursor - ctx.slidesToScroll
        }))
      ]
    }
  ];
  const lastPrev = [
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        // LTR & RTL & infinite === true: Last -> Last , scroll distance is divisable by totalItems
        (ctx.infinite === true && ctx.slidesToScroll % ctx.max === 0) ||
        // LTR & infinite === false: Last -> Last, when infinite is false, no matter what scrollIndex is, carousel will stay in First
        (ctx.dir === "rtl" && ctx.infinite === false)
    },
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        // RTL & infinite === false: Last -> First, scroll distance is equal to or larger than (totalItems - 1)
        (ctx.infinite === false &&
          ctx.dir === "ltr" &&
          ctx.slidesToScroll >= ctx.max - ctx.slidesToShow) ||
        // RTL & RTL & infinite === true: Last -> First , scroll distance is (totalItems - 1) + N*totalItems
        (ctx.infinite === true &&
          ctx.dir === "ltr" &&
          ctx.slidesToScroll % ctx.max <= ctx.slidesToShow),
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
      actions: [
        changeCursor(ctx => ({
          start: ctx.startCursor - ctx.slidesToScroll,
          end: ctx.endCursor - ctx.slidesToScroll
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
      target: "last",
      cond: (ctx: CarouselContext) =>
        (ctx.dir === "ltr" &&
        ctx.infinite === false &&
        ctx.startCursor + ctx.slidesToScroll >= lastGroup.start) || (ctx.dir === "ltr" && ctx.infinite === true && ) || () || (),
      actions: [
        changeCursor(ctx => ({
          start: lastGroup.start,
          end: lastGroup.end
        }))
      ]
    },
    // last item in middle
    {
      target: "last",
      id: "middle-next-last",
      cond: (ctx: CarouselContext) =>
        ctx.dir === "ltr" &&
        // indexInGroup(ctx.startCursor + ctx.slidesToScroll, lastGroup),
        ctx.startCursor + ctx.slidesToScroll >= lastGroup.start,
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
        // ctx.dir === "rtl" && ctx.startCursor - ctx.slidesToScroll === ctx.min,
        ctx.dir === "rtl" && ctx.startCursor - ctx.slidesToScroll <= ctx.min,
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
          start: ctx.startCursor + ctx.slidesToScroll,
          end: ctx.endCursor + ctx.slidesToScroll
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
          start: ctx.startCursor - ctx.slidesToScroll,
          end: ctx.endCursor - ctx.slidesToScroll
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
        ctx.dir === "ltr" && ctx.startCursor - ctx.slidesToScroll <= ctx.min,
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
        ctx.dir === "rtl" &&
        indexInGroup(ctx.startCursor + ctx.slidesToScroll, lastGroup),
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
          start: ctx.startCursor - ctx.slidesToScroll,
          end: ctx.endCursor - ctx.slidesToScroll
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
          start: ctx.startCursor + ctx.slidesToScroll,
          end: ctx.endCursor + ctx.slidesToScroll
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
