import { indexInGroup, constructGroups } from "../utils";
import {
  CarouselEvent,
  HeadlessCarouselProps,
  TernaryContext,
  TernaryCarouselStateSchema,
} from "../types";
import { Machine, assign } from "xstate";
import {
  isCursorValid,
  isCursorOnFirstItem,
  isCursorOnMiddleItems,
  isCursorOnLastItem,
  isRtl,
  isInfinite,
  isCursorOnLastMiddleItem,
  isCursorOnFirstMiddleItem,
} from "./guards";
import { sendNextOnAutoplay, setCursor } from "./actions";
import { cancel } from "xstate/lib/actions";

export function binaryCarouselMachine(config: HeadlessCarouselProps) {
  const {
    totalItems,
    startIndex,
    slidesToShow,
    infinite,
    dir,
    autoPlay,
  } = config;
  const groups = constructGroups({ totalItems, slidesToShow, startIndex });

  let initialContext: TernaryContext;
  initialContext = {
    cursor: startIndex,
    groups,
    infinite,
    dir,
    autoPlay,
  };

  const machine = Machine<
    TernaryContext,
    TernaryCarouselStateSchema,
    CarouselEvent
  >(
    {
      id: "binaryCarousel",
      initial: "playing",
      context: initialContext,
      states: {
        paused: {
          id: "paused",
          on: {
            PLAY: "#binaryCarousel.playing",
          },
        },
        playing: {
          initial: "waiting",
          id: "playing",
          states: {
            waiting: {
              initial: "tmp",
              // Autoplay
              entry: sendNextOnAutoplay(config),
              exit: cancel("sendAutoPlay"),
              // /Autoplay
              on: {
                PAUSE: "#binaryCarousel.paused",
                GO_TO: {
                  target: "#transitioning",
                  cond: "cursorValid",
                  actions: "setCursorOnGoTo",
                },
              },
              states: {
                tmp: {
                  on: {
                    "": [
                      {
                        target: "first",
                        cond: ctx => isCursorOnFirstItem(ctx),
                      },
                      {
                        target: "middle",
                        cond: ctx => isCursorOnMiddleItems(ctx),
                      },
                      {
                        target: "last",
                        cond: ctx => isCursorOnLastItem(ctx),
                      },
                    ],
                  },
                },
                first: {
                  on: {
                    NEXT: [
                      {
                        target: "first",
                        cond: ctx => !isInfinite(ctx) && isRtl(ctx),
                      },
                      {
                        target: "#transitioning",
                        cond: ctx => isInfinite(ctx) && isRtl(ctx),
                        actions: "setCursorToLast",
                      },
                      {
                        target: "#transitioning",
                        actions: "setCursorToFirstMiddleItem",
                      },
                    ],
                    PREV: [
                      {
                        target: "first",
                        cond: ctx => !isInfinite(ctx) && !isRtl(ctx),
                      },
                      {
                        target: "#transitioning",
                        cond: ctx => isInfinite(ctx) && !isRtl(ctx),
                        actions: "setCursorToLast",
                      },
                      {
                        target: "#transitioning",
                        actions: "setCursorToFirstMiddleItem",
                      },
                    ],
                  },
                },
                middle: {
                  on: {
                    NEXT: [
                      {
                        target: "#transitioning",
                        cond: ctx =>
                          isCursorOnLastMiddleItem(ctx) && !isRtl(ctx),
                        actions: "setCursorToLast",
                      },
                      {
                        target: "#transitioning",
                        cond: ctx =>
                          isCursorOnFirstMiddleItem(ctx) && isRtl(ctx),
                        actions: "setCursorToFirst",
                      },
                      {
                        target: "#transitioning",
                        cond: ctx => !isRtl(ctx),
                        actions: "incrementCursor",
                      },
                      {
                        target: "#transitioning",
                        cond: ctx => isRtl(ctx),
                        actions: "decrementCursor",
                      },
                    ],
                    PREV: [
                      {
                        target: "#transitioning",
                        cond: ctx =>
                          isCursorOnLastMiddleItem(ctx) && isRtl(ctx),
                        actions: "setCursorToLast",
                      },
                      {
                        target: "#transitioning",
                        cond: ctx =>
                          isCursorOnFirstMiddleItem(ctx) && !isRtl(ctx),
                        actions: "setCursorToFirst",
                      },
                      {
                        target: "#transitioning",
                        cond: ctx => !isRtl(ctx),
                        actions: "decrementCursor",
                      },
                      {
                        target: "#transitioning",
                        cond: ctx => isRtl(ctx),
                        actions: "incrementCursor",
                      },
                    ],
                  },
                },
                last: {
                  on: {
                    NEXT: [
                      {
                        target: "last",
                        cond: ctx => !isInfinite(ctx) && !isRtl(ctx),
                      },
                      {
                        target: "#transitioning",
                        cond: ctx => isInfinite(ctx) && !isRtl(ctx),
                        actions: "setCursorToFirst",
                      },
                      {
                        target: "#transitioning",
                        actions: "setCursorToLastMiddleItem",
                      },
                    ],
                    PREV: [
                      {
                        target: "last",
                        cond: ctx => !isInfinite(ctx) && isRtl(ctx),
                      },
                      {
                        target: "#transitioning",
                        cond: ctx => isInfinite(ctx) && isRtl(ctx),
                        actions: "setCursorToFirst",
                      },
                      {
                        target: "#transitioning",
                        actions: "setCursorToLastMiddleItem",
                      },
                    ],
                  },
                },
              },
            },
            transitioning: {
              id: "transitioning",
              after: {
                TRANSITION_DELAY: "#playing",
              },
            },
          },
        },
      },
    },
    {
      actions: {
        setCursorToFirst: setCursor(1),
        setCursorToLast: setCursor(ctx => ctx.groups.length),
        setCursorOnGoTo: setCursor((_, e) => e.data),
        setCursorToFirstMiddleItem: setCursor(2),
        setCursorToLastMiddleItem: setCursor(ctx => ctx.groups.length - 1),
        incrementCursor: setCursor(ctx => ctx.cursor + 1),
        decrementCursor: setCursor(ctx => ctx.cursor - 1),
      },
      guards: {
        cursorValid: isCursorValid,
      },
    },
  );

  return machine;
}
