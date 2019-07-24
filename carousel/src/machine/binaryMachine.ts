import { CarouselMachineFactoryConfig } from "./factory";
import { changeCursor } from "./updater";
import {
  hasAutoPlay,
  isCursorValid,
  indexInGroup,
  constructGroups,
  isEven,
} from "../utils";
import {
  CarouselContext,
  CarouselEvent,
  BinaryCarouselStateSchema,
  Dir,
} from "../types";
import { Machine } from "xstate";

// e.data is the cursor of the group to which we need to transition
const goTo = [
  {
    target: "first",
    cond: (ctx: CarouselContext, e: CarouselEvent) =>
      isCursorValid(e.data, ctx.min, ctx.max) && e.data === 1,
    actions: [changeCursor(ctx => 1)],
  },
  {
    target: "last",
    cond: (ctx: CarouselContext, e: CarouselEvent) =>
      isCursorValid(e.data, ctx.min, ctx.max) && e.data === 2,
    actions: [changeCursor(ctx => 2)],
  },
];

interface BinaryConfig extends CarouselMachineFactoryConfig {
  dir: Dir;
  infinite: boolean;
  slidesToShow: number;
}
export function binaryCarouselMachine(config: BinaryConfig) {
  const {
    totalItems,
    startIndex,
    slidesToShow,
    infinite,
    autoPlay,
    dir,
  } = config;
  const firstNext = [
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        ctx.infinite === false && ctx.dir === "rtl",
    },
    {
      target: "last",
      actions: [changeCursor(ctx => 2)],
    },
  ];
  const firstPrev = [
    {
      target: "first",
      cond: (ctx: CarouselContext) =>
        ctx.infinite === false && ctx.dir === "ltr",
    },
    {
      target: "last",
      actions: [changeCursor(ctx => 2)],
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
      cond: (ctx: CarouselContext) =>
        ctx.infinite === false && ctx.dir === "ltr",
    },
    {
      target: "first",
      actions: [changeCursor(ctx => 1)],
    },
  ];
  const lastPrev = [
    {
      target: "last",
      cond: (ctx: CarouselContext) =>
        ctx.infinite === false && ctx.dir === "rtl",
    },
    {
      target: "first",
      actions: [changeCursor(ctx => 1)],
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
  const groups = constructGroups({ totalItems, slidesToShow, startIndex });
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
  if (indexInGroup(startIndex, groups[0])) {
    initial = "first";
    initialContext = {
      ...initialContext,
      cursor: 1,
    };
  } else if (indexInGroup(startIndex, groups[1])) {
    initial = "lsat";
    initialContext = {
      ...initialContext,
      cursor: 2,
    };
  } else {
    throw Error(
      "invalid config on binaryCarouselMachine. startIndex doesn not belong to first and last state.",
    );
  }
  return Machine<CarouselContext, BinaryCarouselStateSchema, CarouselEvent>({
    id: "binaryCarousel",
    initial,
    context: initialContext,
    states: {
      first: first,
      last: last,
    },
  });
}