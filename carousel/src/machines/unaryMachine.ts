import { UnaryCarouselStateSchema, Context } from "../types";

import { Machine } from "xstate";

export function unaryCarouselMachine() {
  return Machine<Context, UnaryCarouselStateSchema>({
    id: "unaryCarousel",
    initial: "running",
    states: {
      running: {},
    },
  });
}
