import { TernaryContext, HeadlessCarouselProps } from "../types";
import { EventObject, assign, SendAction, send } from "xstate";
import { hasAutoPlay, noop } from "../utils";

export function setCursor(
  cursorSetter: number | ((ctx: TernaryContext, e: EventObject) => number),
) {
  return assign<TernaryContext>({
    cursor: cursorSetter,
  });
}

export function sendNextOnAutoplay(
  config: HeadlessCarouselProps,
): SendAction<TernaryContext, EventObject> | (() => void) {
  return hasAutoPlay(config)
    ? send<TernaryContext, EventObject>(
        { type: "NEXT" },
        { delay: "AUTOPLAY", id: "sendAutoPlay" },
      )
    : noop;
}
