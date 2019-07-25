import { changeCursor } from "./updater";
import {
  hasAutoPlay,
  isCursorValid,
  indexInGroup,
  constructGroups,
} from "../utils";
import {
  CarouselContext,
  CarouselEvent,
  BinaryCarouselStateSchema,
  BinaryCarouselStateSchemaWithAutoplay,
  HeadlessCarouselProps,
} from "../types";
import { Machine, MachineOptions } from "xstate";

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
];

export function binaryCarouselMachine(config: HeadlessCarouselProps) {
  const { totalItems, startIndex, slidesToShow, infinite, dir } = config;
  const firstNext = [
    {
      target: "first",
      cond: "finite&RTL",
    },
    {
      target: "last",
      actions: ["setCursorToLastGroup"],
    },
  ];
  const firstPrev = [
    {
      target: "first",
      cond: "finite&LTR",
    },
    {
      target: "last",
      actions: ["setCursorToLastGroup"],
    },
  ];
  const first = {
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
    },
    {
      target: "first",
      actions: ["setCursorToFirstGroup"],
    },
  ];
  const lastPrev = [
    {
      target: "last",
      cond: "finite&RTL",
    },
    {
      target: "first",
      actions: ["setCursorToFirstGroup"],
    },
  ];
  const last = {
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

  // Implementationd details
  const machineImplementation: Partial<
    MachineOptions<CarouselContext, CarouselEvent>
  > = {
    actions: {
      setCursorToFirstGroup: changeCursor(() => 1),
      setCursorToLastGroup: changeCursor(ctx => ctx.groups.length),
      setCursorToData: changeCursor((ctx, e) => e.data),
      incrementCursor: changeCursor(ctx => ctx.cursor + 1),
      decrementCursor: changeCursor(ctx => ctx.cursor - 1),
    },
    guards: {
      "finite&RTL": ctx => ctx.infinite === false && ctx.dir === "rtl",
      "finite&LTR": ctx => ctx.infinite === false && ctx.dir === "ltr",
      "cursorValid&firstGroup": (ctx, e) =>
        isCursorValid(e.data, ctx.min, ctx.max) && e.data === 1,
      "cursorValid&lastGroup": (ctx, e) =>
        isCursorValid(e.data, ctx.min, ctx.max) && e.data === ctx.groups.length,
    },
  };

  // With AutoPlay
  if (hasAutoPlay(config)) {
    const autoPlay = config.autoPlay as number;
    return Machine<
      CarouselContext,
      BinaryCarouselStateSchemaWithAutoplay,
      CarouselEvent
    >(
      {
        id: "binaryCarouselWithAutoPlay",
        initial: "playing",
        context: initialContext,
        states: {
          playing: {
            initial,
            states: {
              first: {
                ...first,
                id: "playing_first",
                on: { ...first.on, PAUSE: "#paused_first" },
                after: {
                  [autoPlay]: firstNext,
                },
              },
              last: {
                ...last,
                id: "playing_last",
                on: { ...last.on, PAUSE: "#paused_last" },
                after: {
                  [autoPlay]: lastNext,
                },
              },
            },
          },
          paused: {
            initial,
            states: {
              first: {
                ...first,
                id: "paused_first",
                on: { ...first.on, PLAY: "#playing_first" },
              },
              last: {
                ...last,
                id: "paused_last",
                on: { ...last.on, PLAY: "#playing_last" },
              },
            },
          },
        },
      },
      machineImplementation,
    );
  }

  return Machine<CarouselContext, BinaryCarouselStateSchema, CarouselEvent>(
    {
      id: "binaryCarousel",
      initial,
      context: initialContext,
      states: {
        first: first,
        last: last,
      },
    },
    machineImplementation,
  );
}
