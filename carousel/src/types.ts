import { EventObject, StateNodeConfig } from "xstate";

export type CarouselState = "first" | "middle" | "last";
export type CarouselType = "Unary" | "Binary" | "Ternary";
export type CarouselContext = {
  cursor: number;
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
export type CarouselStateSchemaWithAutoplay = {
  states: {
    playing: CarouselStateSchema;
    paused: CarouselStateSchema;
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
export type BinaryCarouselStateSchemaWithAutoplay = {
  states: {
    playing: BinaryCarouselStateSchema;
    paused: BinaryCarouselStateSchema;
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

export type CarouselStateNodeConfig = StateNodeConfig<
  CarouselContext,
  CarouselStateSchema,
  CarouselEvent
>;

export type Group = number[];
