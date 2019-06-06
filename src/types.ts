import { EventObject, StateNodeConfig } from "xstate";

export type CarouselState = "first" | "middle" | "last";
export type CarouselContext = {
  cursor: number;
  min: number;
  max: number;
  dir: Dir;
  infinite: boolean;
};
export type CarouselStateSchema = {
  states: {
    first: {};
    middle: {};
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
