export type CarouselState = "first" | "middle" | "last";
export type CarouselType = "Unary" | "Binary" | "Ternary";
export type CarouselEvent = "NEXT" | "PREV" | "GO_TO" | "PLAY" | "PAUSE";

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

export type HeadlessCarouselProps = CarouselConfig & {
  startIndex: number;
  slidesToShow: number;
  infinite: boolean;
  dir: Dir;
  onTransition?: () => void;
  onEvent?: (eventType: CarouselEvent) => void;
};

export type CarouselProps = HeadlessCarouselProps & {
  items: JSX.Element[];
};

export type Dir = "ltr" | "rtl";

export type Group = number[];
export type Context = {
  cursor: number;
  groups: Group[];
  infinite: boolean;
  dir: Dir;
  autoPlay?: number;
};
