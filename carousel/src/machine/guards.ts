import { Context } from "../types";
import { EventObject } from "xstate";

type Guard = (ctx: Context) => boolean;

export const isInfinite: Guard = ctx => {
  return ctx.infinite === true;
};

export const isRtl: Guard = ctx => {
  return ctx.dir === "rtl";
};

export const isCursorOnFirstItem: Guard = ctx => {
  return ctx.cursor === 1;
};

export const isCursorOnLastItem: Guard = ctx => {
  return ctx.cursor === ctx.groups.length;
};

export const isCursorOnFirstMiddleItem: Guard = ctx => {
  return ctx.cursor === 2;
};

export const isCursorOnLastMiddleItem: Guard = ctx => {
  return ctx.cursor === ctx.groups.length - 1;
};

export const isCursorOnMiddleItems: Guard = ctx => {
  return ctx.cursor > 1 && ctx.cursor < ctx.groups.length;
};

export const isCursorValid: (ctx: Context, e: EventObject) => boolean = (
  ctx,
  e,
) => {
  return e.data <= ctx.groups.length && e.data >= 1;
};
