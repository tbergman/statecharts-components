import { EventObject } from "xstate";

export type CarouselState = "first" | "middle" | "last";
export type CarouselType = "Unary" | "Binary" | "Ternary";

export type UnaryCarouselStateSchema = {
  states: {
    running: {};
  };
};
export type BinaryCarouselStateSchema = {
  states: {
    paused: {};
    playing: {
      states: {
        waiting: {
          states: {
            tmp: {};
            first: {};
            last: {};
          };
        };
        transitioning: {};
      };
    };
  };
};
export type TernaryCarouselStateSchema = {
  states: {
    paused: {};
    playing: {
      states: {
        waiting: {
          states: {
            tmp: {};
            first: {};
            middle: {};
            last: {};
          };
        };
        transitioning: {};
      };
    };
  };
};

export type CarouselEvent = EventObject;

export type CarouselConfig = {
  totalItems: number;
  startIndex?: number;
  autoPlay?: number;
  dir?: Dir;
  infinite?: boolean;
  slidesToShow?: number;
  responsive?: boolean;
  transitionDelay?: number;
};
export type CarouselProps = CarouselConfig & {
  items: JSX.Element[];
};

export type HeadlessCarouselProps = CarouselConfig & {
  startIndex: number;
  slidesToShow: number;
  infinite: boolean;
  dir: Dir;
};

export type Dir = "ltr" | "rtl";

export type Group = number[];
export type TernaryContext = {
  cursor: number;
  groups: Group[];
  infinite: boolean;
  dir: Dir;
  autoPlay?: number;
};
