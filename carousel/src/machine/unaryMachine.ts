import { UnaryCarouselStateSchema } from "../types";

import { Machine } from "xstate";

export function unaryCarouselMachine() {
  return Machine<undefined, UnaryCarouselStateSchema>({
    id: "unaryCarousel",
    initial: "running",
    states: {
      running: {},
    },
  });
}
