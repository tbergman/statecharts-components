import { Context, HeadlessCarouselProps } from "../types";
import { EventObject, assign, SendAction, send } from "xstate";
import { hasAutoPlay, noop } from "../utils";

export function setCursor(
  cursorSetter: number | ((ctx: Context, e: EventObject) => number),
) {
  return assign<Context>({
    cursor: cursorSetter,
  });
}

export function sendNextOnAutoplay(
  config: HeadlessCarouselProps,
): SendAction<Context, EventObject> | (() => void) {
  return hasAutoPlay(config)
    ? send<Context, EventObject>(
        { type: "NEXT" },
        { delay: "AUTOPLAY", id: "sendAutoPlay" },
      )
    : noop;
}
