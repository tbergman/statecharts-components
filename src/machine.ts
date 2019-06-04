import { Machine, assign, EventObject, StateNodeConfig } from "xstate";

type State = "first" | "middle" | "last";
type Context = {
  cursor: number;
  min: number;
  max: number;
};
type StateSchema = {
  states: {
    first: {};
    middle: {};
    last: {};
  };
};

type Event = EventObject;

const guards = {
  isFirstItem: (nextCursor: number | undefined, min: number) =>
    nextCursor !== undefined && nextCursor === min,
  isLastItem: (nextCursor: number | undefined, max: number) =>
    nextCursor !== undefined && nextCursor === max,
  isCursorValid: (nextCursor: number | undefined, min: number, max: number) => {
    return nextCursor !== undefined && nextCursor <= max && nextCursor >= min;
  }
};

function goToTransitionConfig() {
  return [
    {
      target: "first",
      cond: (ctx: Context, e: Event) =>
        guards.isCursorValid(e.data, ctx.min, ctx.max) &&
        guards.isFirstItem(e.data, ctx.min),
      actions: [
        assign({
          cursor: (ctx: Context) => ctx.min,
          max: (ctx: Context) => ctx.max,
          min: (ctx: Context) => ctx.min
        })
      ]
    },
    {
      target: "last",
      cond: (ctx: Context, e: Event) =>
        guards.isCursorValid(e.data, ctx.min, ctx.max) &&
        guards.isLastItem(e.data, ctx.max),
      actions: [
        assign({
          cursor: (ctx: Context) => ctx.max,
          max: (ctx: Context) => ctx.max,
          min: (ctx: Context) => ctx.min
        })
      ]
    },
    {
      target: "middle",
      cond: (ctx: Context, e: Event) =>
        guards.isCursorValid(e.data, ctx.min, ctx.max),
      actions: [
        assign({
          cursor: (_: Context, e: Event) => e.data as number,
          max: (ctx: Context) => ctx.max,
          min: (ctx: Context) => ctx.min
        })
      ]
    }
  ];
}

interface CarouselMachineFactoryConfig {
  totalItems: number;
  startIndex: number;
  autoPlay?: number;
}
export function carouselMachineFactory({
  totalItems,
  startIndex,
  autoPlay
}: CarouselMachineFactoryConfig) {
  if (startIndex < 1 || startIndex > totalItems) {
    throw Error(
      "invalid startIndex on carouselMachine. startIndex should satisfy 1 <= startIndex <= totalItems"
    );
  }
  let initial: State = "first";
  let initialContext: Context = { cursor: startIndex, min: 1, max: totalItems };

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
  let first: StateNodeConfig<Context, {}, Event> = {
    on: {
      NEXT: {
        target: "middle",
        actions: [
          assign({
            cursor: ctx => ctx.cursor + 1,
            max: ctx => ctx.max,
            min: ctx => ctx.min
          })
        ]
      },
      PREV: {
        target: "last",
        actions: [
          assign({
            cursor: ctx => ctx.max,
            max: ctx => ctx.max,
            min: ctx => ctx.min
          })
        ]
      },
      GO_TO: goToTransitionConfig()
    }
  };
  if (autoPlay !== undefined) {
    first = {
      ...first,
      after: {
        [autoPlay]: {
          target: "middle",
          actions: [
            assign({
              cursor: ctx => ctx.cursor + 1,
              max: ctx => ctx.max,
              min: ctx => ctx.min
            })
          ]
        }
      }
    };
  }

  let middle: StateNodeConfig<Context, {}, Event> = {
    on: {
      PREV: [
        {
          target: "first",
          cond: ctx => guards.isFirstItem(ctx.cursor - 1, ctx.min),
          actions: [
            assign({
              cursor: ctx => ctx.cursor - 1,
              max: ctx => ctx.max,
              min: ctx => ctx.min
            })
          ]
        },
        {
          target: "middle",
          actions: [
            assign({
              cursor: ctx => ctx.cursor - 1,
              max: ctx => ctx.max,
              min: ctx => ctx.min
            })
          ]
        }
      ],
      NEXT: [
        {
          target: "last",
          cond: ctx => guards.isLastItem(ctx.cursor + 1, ctx.max),
          actions: [
            assign({
              cursor: ctx => ctx.cursor + 1,
              max: ctx => ctx.max,
              min: ctx => ctx.min
            })
          ]
        },
        {
          target: "middle",
          actions: [
            assign({
              cursor: ctx => ctx.cursor + 1,
              max: ctx => ctx.max,
              min: ctx => ctx.min
            })
          ]
        }
      ],
      GO_TO: goToTransitionConfig()
    }
  };
  if (autoPlay !== undefined) {
    middle = {
      ...middle,
      after: {
        [autoPlay]: [
          {
            target: "last",
            cond: ctx => guards.isLastItem(ctx.cursor + 1, ctx.max),
            actions: [
              assign({
                cursor: ctx => ctx.max,
                max: ctx => ctx.max,
                min: ctx => ctx.min
              })
            ]
          },
          {
            target: "middle",
            actions: [
              assign({
                cursor: ctx => ctx.cursor + 1,
                max: ctx => ctx.max,
                min: ctx => ctx.min
              })
            ]
          }
        ]
      }
    };
  }

  let last: StateNodeConfig<Context, {}, Event> = {
    on: {
      PREV: {
        target: "middle",
        actions: [
          assign({
            cursor: ctx => ctx.cursor - 1,
            max: ctx => ctx.max,
            min: ctx => ctx.min
          })
        ]
      },
      NEXT: {
        target: "first",
        actions: [
          assign({
            cursor: ctx => ctx.cursor + 1,
            max: ctx => ctx.max,
            min: ctx => ctx.min
          })
        ]
      },
      GO_TO: goToTransitionConfig()
    }
  };
  if (autoPlay !== undefined) {
    last = {
      ...last,
      after: {
        [autoPlay]: {
          target: "first",
          actions: [
            assign({
              cursor: ctx => ctx.min,
              max: ctx => ctx.max,
              min: ctx => ctx.min
            })
          ]
        }
      }
    };
  }

  /**
   * Machine config
   */
  const machine = Machine<Context, StateSchema, Event>({
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
