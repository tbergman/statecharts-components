import { Dir } from "../types";
import { noop } from "../utils";

export const defaultConfig = {
  dir: "ltr" as Dir,
  infinite: false,
  slidesToShow: 1,
  startIndex: 1,
  responsive: true,
  transitionDelay: 350,
  autoPlay: 2000,
  onTransition: noop,
  onEvent: noop,
};
