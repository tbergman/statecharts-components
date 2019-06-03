import { Machine, assign, EventObject } from "xstate";

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

type GoToEvent = { type: "GO_TO"; data: number };
type Event = { type: "NEXT" } | { type: "PREV" } | GoToEvent;

const guards = {
  isFirstItem: (nextCursor: number, min: number) => nextCursor === min,
  isLastItem: (nextCursor: number, max: number) => nextCursor === max,
  isCursorValid: (newCursor: number, min: number, max: number) => {
    return newCursor <= max && newCursor >= min;
  }
};

const actions = {
  incCursor: assign({
    cursor: (ctx: Context) => ctx.cursor + 1,
    max: (ctx: Context) => ctx.max,
    min: (ctx: Context) => ctx.min
  }),
  decCursor: assign({
    cursor: (ctx: Context) => ctx.cursor - 1,
    max: (ctx: Context) => ctx.max,
    min: (ctx: Context) => ctx.min
  }),
  setCursorTo: (cursor: number) =>
    assign({
      cursor: cursor,
      max: (ctx: Context) => ctx.max,
      min: (ctx: Context) => ctx.min
    })
};

export const machine = Machine<Context, StateSchema, Event>({
  id: "carousel",
  initial: "first",
  context: { cursor: 1, min: 1, max: 5 },
  states: {
    first: {
      on: {
        NEXT: {
          target: "middle",
          actions: [actions.incCursor]
        },
        PREV: {
          target: "last",
          actions: [actions.setCursorTo(5)]
        },
        GO_TO: [
          {
            target: "first",
            cond: (ctx, e) =>
              guards.isCursorValid(e.data, ctx.min, ctx.max) &&
              guards.isFirstItem(e.data, ctx.min),
            actions: [actions.setCursorTo(1), () => console.log("first")]
          },
          {
            target: "last",
            cond: (ctx, e) =>
              guards.isCursorValid(e.data, ctx.min, ctx.max) &&
              guards.isLastItem(e.data, ctx.max),
            actions: [actions.setCursorTo(5), () => console.log("last")]
          },
          {
            target: "middle",
            cond: (ctx, e) => guards.isCursorValid(e.data, ctx.min, ctx.max),
            actions: [
              assign({
                cursor: (ctx, e) => e.data
              }),
              () => console.log("middle")
            ]
          }
        ]
      }
    },
    middle: {
      on: {
        PREV: [
          {
            target: "first",
            cond: ctx => guards.isFirstItem(ctx.cursor - 1, ctx.min),
            actions: [actions.decCursor]
          },
          { target: "middle", actions: [actions.decCursor] }
        ],
        NEXT: [
          {
            target: "last",
            cond: ctx => guards.isLastItem(ctx.cursor + 1, ctx.max),
            actions: [actions.incCursor]
          },
          { target: "middle", actions: [actions.incCursor] }
        ],
        GO_TO: [
          {
            target: "first",
            cond: (ctx, e) =>
              guards.isCursorValid(e.data, ctx.min, ctx.max) &&
              guards.isFirstItem(e.data, ctx.min),
            actions: [actions.setCursorTo(1)]
          },
          {
            target: "last",
            cond: (ctx, e) =>
              guards.isCursorValid(e.data, ctx.min, ctx.max) &&
              guards.isLastItem(e.data, ctx.max),
            actions: [actions.setCursorTo(5)]
          },
          {
            target: "middle",
            cond: (ctx, e) => guards.isCursorValid(e.data, ctx.min, ctx.max),
            actions: [
              assign({
                cursor: (ctx, e) => e.data
              })
            ]
          }
        ]
      }
    },
    last: {
      on: {
        PREV: {
          target: "middle",
          actions: [actions.decCursor]
        },
        NEXT: {
          target: "first",
          actions: [actions.setCursorTo(1)]
        },
        GO_TO: [
          {
            target: "first",
            cond: (ctx, e) =>
              guards.isCursorValid(e.data, ctx.min, ctx.max) &&
              guards.isFirstItem(e.data, ctx.min),
            actions: [actions.setCursorTo(1)]
          },
          {
            target: "last",
            cond: (ctx, e) =>
              guards.isCursorValid(e.data, ctx.min, ctx.max) &&
              guards.isLastItem(e.data, ctx.max),
            actions: [actions.setCursorTo(5)]
          },
          {
            target: "middle",
            cond: (ctx, e) => guards.isCursorValid(e.data, ctx.min, ctx.max),
            actions: [
              assign({
                cursor: (ctx, e) => e.data
              })
            ]
          }
        ]
      }
    }
  }
});
