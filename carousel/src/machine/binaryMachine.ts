import {
  hasAutoPlay,
  isCursorValid,
  indexInGroup,
  constructGroups,
} from "../utils";
import {
  CarouselEvent,
  BinaryCarouselStateSchema,
  HeadlessCarouselProps,
  BinaryContext,
} from "../types";
import { Machine, assign } from "xstate";

export function binaryCarouselMachine(config: HeadlessCarouselProps) {
  const { totalItems, startIndex, slidesToShow } = config;
  const groups = constructGroups({ totalItems, slidesToShow, startIndex });

  let initialContext: BinaryContext;
  initialContext = {
    cursor: startIndex,
    groups,
  };

  if (indexInGroup(startIndex, groups[0])) {
    initialContext = {
      ...initialContext,
      cursor: 1,
    };
  } else if (indexInGroup(startIndex, groups[1])) {
    initialContext = {
      ...initialContext,
      cursor: 2,
    };
  } else {
    throw Error(
      "invalid config on binaryCarouselMachine. startIndex is invalid",
    );
  }

  const machine = Machine<
    BinaryContext,
    BinaryCarouselStateSchema,
    CarouselEvent
  >(
    {
      id: "binaryCarousel",
      initial: "waiting",
      context: initialContext,
      states: {
        waiting: {
          initial: "tmp",
          states: {
            tmp: {
              on: {
                "": [
                  {
                    target: "first",
                    cond: ctx => ctx.cursor === 1,
                  },
                  {
                    target: "last",
                    cond: ctx => ctx.cursor === 2,
                  },
                ],
              },
            },
            first: {
              ...(hasAutoPlay(config) && {
                after: {
                  AUTOPLAY: "#binaryCarousel.transitioning",
                },
              }),
              on: {
                NEXT: "#binaryCarousel.transitioning",
                PREV: "#binaryCarousel.transitioning",
                GO_TO: {
                  target: "#binaryCarousel.transitioning",
                  cond: "cursorValid",
                },
              },
            },
            last: {
              ...(hasAutoPlay(config) && {
                after: {
                  AUTOPLAY: "#binaryCarousel.transitioning",
                },
              }),
              on: {
                NEXT: "#binaryCarousel.transitioning",
                PREV: "#binaryCarousel.transitioning",
                GO_TO: {
                  target: "#binaryCarousel.transitioning",
                  cond: "cursorValid",
                },
              },
            },
          },
        },
        transitioning: {
          onEntry: assign<BinaryContext>({
            cursor: (ctx, e) => e.data || (ctx.cursor == 1 ? 2 : 1),
          }),
          after: {
            TRANSITION_DELAY: "#binaryCarousel.waiting.tmp",
          },
        },
      },
    },
    {
      delays: {
        ...(hasAutoPlay(config) && { AUTOPLAY: config.autoPlay as number }),
        TRANSITION_DELAY: 350,
      },
      guards: {
        cursorValid: (_, e) => isCursorValid(e.data, 1, 2),
      },
    },
  );

  return machine;
}
