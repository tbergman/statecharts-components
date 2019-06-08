import { EventObject, StateNodeConfig } from "xstate";

export type CarouselState = "first" | "middle" | "last";
export type CarouselContext = {
  startCursor: number;
  endCursor: number;
  min: number;
  max: number;
  dir: Dir;
  infinite: boolean;
  slidesToShow: number;
  groups: Group[];
};
export type CarouselStateSchema = {
  states: {
    first: {};
    middle: {};
    last: {};
  };
};
export type UnaryCarouselStateSchema = {
  states: {
    running: {};
  };
};
export type BinaryCarouselStateSchema = {
  states: {
    first: {};
    last: {};
  };
};

export type CarouselEvent = EventObject;

export type Dir = "ltr" | "rtl";

export type CarouselStateNodeConfig = StateNodeConfig<
  CarouselContext,
  CarouselStateSchema,
  CarouselEvent
>;

export type Group = { start: number; end: number };
