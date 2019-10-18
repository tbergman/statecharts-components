import { Dir } from "../types";
import { noop } from "../utils";

export const defaultConfig = {
  dir: "ltr" as Dir,
  infinite: false,
  slidesToShow: 1,
  startIndex: 1,
  responsive: true,
  transitionDelay: 350,
  onTransition: noop,
  onEvent: noop,
  swipe: true,
};
