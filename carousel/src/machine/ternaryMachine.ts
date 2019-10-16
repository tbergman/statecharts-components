import { constructGroups, hasAutoPlay } from "../utils";
import {
  TernaryCarouselStateSchema,
  HeadlessCarouselProps,
  Context,
} from "../types";
import { Machine, EventObject, StateNodeConfig } from "xstate";
import { cancel, raise, log } from "xstate/lib/actions";
import {
  isCursorValid,
  isInfinite,
  isRtl,
  isCursorOnLastMiddleItem,
  isCursorOnFirstMiddleItem,
  isCursorOnLastItem,
  isCursorOnMiddleItems,
  isCursorOnFirstItem,
} from "./guards";
import { setCursor, sendNextOnAutoplay } from "./actions";

export function ternaryCarouselMachine(config: HeadlessCarouselProps) {
  const {
    totalItems,
    startIndex,
    slidesToShow,
    infinite,
    dir,
    autoPlay,
  } = config;
  const groups = constructGroups({ totalItems, slidesToShow, startIndex });

  const initialContext: Context = {
    cursor: startIndex,
    groups,
    infinite,
    dir,
    autoPlay,
  };

  const waitingState: StateNodeConfig<
    Context,
    {
      states: {
        tmp: {};
        first: {};
        middle: {};
        last: {};
      };
    },
    EventObject
  > = {
    initial: "tmp",
    on: {
      GO_TO: {
        target: `transitioning`,
        cond: "cursorValid",
        actions: "setCursorOnGoTo",
      },
      TRANSITION: "transitioning",
    },
    states: {
      tmp: {
        on: {
          "": [
            {
              target: "first",
              cond: (ctx: Context) => isCursorOnFirstItem(ctx),
            },
            {
              target: "middle",
              cond: (ctx: Context) => isCursorOnMiddleItems(ctx),
            },
            {
              target: "last",
              cond: (ctx: Context) => isCursorOnLastItem(ctx),
            },
          ],
        },
      },
      first: {
        on: {
          NEXT: [
            {
              target: "first",
              cond: (ctx: Context) => !isInfinite(ctx) && isRtl(ctx),
            },
            {
              cond: (ctx: Context) => isInfinite(ctx) && isRtl(ctx),
              actions: ["setCursorToLast", raise("TRANSITION")],
            },
            {
              actions: ["setCursorToFirstMiddleItem", raise("TRANSITION")],
            },
          ],
          PREV: [
            {
              target: "first",
              cond: (ctx: Context) => !isInfinite(ctx) && !isRtl(ctx),
            },
            {
              cond: (ctx: Context) => isInfinite(ctx) && !isRtl(ctx),
              actions: ["setCursorToLast", raise("TRANSITION")],
            },
            {
              actions: ["setCursorToFirstMiddleItem", raise("TRANSITION")],
            },
          ],
        },
      },
      middle: {
        on: {
          NEXT: [
            {
              cond: (ctx: Context) =>
                isCursorOnLastMiddleItem(ctx) && !isRtl(ctx),
              actions: ["setCursorToLast", raise("TRANSITION")],
            },
            {
              cond: (ctx: Context) =>
                isCursorOnFirstMiddleItem(ctx) && isRtl(ctx),
              actions: ["setCursorToFirst", raise("TRANSITION")],
            },
            {
              cond: (ctx: Context) => !isRtl(ctx),
              actions: ["incrementCursor", raise("TRANSITION")],
            },
            {
              cond: (ctx: Context) => isRtl(ctx),
              actions: ["decrementCursor", raise("TRANSITION")],
            },
          ],
          PREV: [
            {
              cond: (ctx: Context) =>
                isCursorOnLastMiddleItem(ctx) && isRtl(ctx),
              actions: ["setCursorToLast", raise("TRANSITION")],
            },
            {
              cond: (ctx: Context) =>
                isCursorOnFirstMiddleItem(ctx) && !isRtl(ctx),
              actions: ["setCursorToFirst", raise("TRANSITION")],
            },
            {
              cond: (ctx: Context) => !isRtl(ctx),
              actions: ["decrementCursor", raise("TRANSITION")],
            },
            {
              cond: (ctx: Context) => isRtl(ctx),
              actions: ["incrementCursor", raise("TRANSITION")],
            },
          ],
        },
      },
      last: {
        on: {
          NEXT: [
            {
              target: "last",
              cond: (ctx: Context) => !isInfinite(ctx) && !isRtl(ctx),
            },
            {
              cond: (ctx: Context) => isInfinite(ctx) && !isRtl(ctx),
              actions: ["setCursorToFirst", raise("TRANSITION")],
            },
            {
              actions: ["setCursorToLastMiddleItem", raise("TRANSITION")],
            },
          ],
          PREV: [
            {
              target: "last",
              cond: (ctx: Context) => !isInfinite(ctx) && isRtl(ctx),
            },
            {
              cond: (ctx: Context) => isInfinite(ctx) && isRtl(ctx),
              actions: ["setCursorToFirst", raise("TRANSITION")],
            },
            {
              actions: ["setCursorToLastMiddleItem", raise("TRANSITION")],
            },
          ],
        },
      },
    },
  };

  const machine = Machine<Context, TernaryCarouselStateSchema, EventObject>(
    {
      id: "ternaryCarousel",
      initial: hasAutoPlay(config) ? "autoplay_on" : "autoplay_off",
      context: initialContext,
      states: {
        autoplay_on: {
          initial: "released",
          states: {
            grabbed: {
              on: {
                RELEASE: "released",
              },
            },
            released: {
              id: "released_on",
              initial: "playing",
              on: {
                GRAB: "grabbed",
              },
              states: {
                paused: {
                  id: "paused",
                  initial: "waiting",
                  on: {
                    PLAY: "#playing",
                  },
                  states: {
                    waiting: waitingState,
                    transitioning: {
                      after: {
                        TRANSITION_DELAY: "waiting",
                      },
                    },
                  },
                },
                playing: {
                  initial: "waiting",
                  id: "playing",
                  on: { PAUSE: "#paused" },
                  states: {
                    waiting: {
                      ...waitingState,
                      // Autoplay
                      entry: sendNextOnAutoplay(config),
                      exit: cancel("sendAutoPlay"),
                      // /Autoplay
                    },
                    transitioning: {
                      after: {
                        TRANSITION_DELAY: "waiting",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        autoplay_off: {
          initial: "released",
          states: {
            grabbed: {
              on: {
                RELEASE: "released",
              },
            },
            released: {
              id: "released_off",
              initial: "waiting",
              on: {
                GRAB: "grabbed",
              },
              states: {
                waiting: waitingState,
                transitioning: {
                  after: {
                    TRANSITION_DELAY: "waiting",
                  },
                },
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
