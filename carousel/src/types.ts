export type CarouselState = "first" | "middle" | "last";
export type CarouselType = "Unary" | "Binary" | "Ternary";
export type CarouselEvent =
  | "NEXT"
  | "PREV"
  | "GO_TO"
  | "PLAY"
  | "PAUSE"
  | "GRAB"
  | "RELEASE"
  | "AUTOPLAY_ON"
  | "AUTOPLAY_OFF";

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

type TernaryWaiting = {
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

type TernaryWithAutoplay = {
  states: {
    paused: TernaryWaiting;
    playing: TernaryWaiting;
  };
};

export type TernaryCarouselStateSchema = {
  /**
   * Having both turned off and turned on machine in a single machine allows transitioning between them
   * which means a machine with no autoplay can be turned on on demand without
   * reinstantiating anf continue with autoplay.
   */
  states: {
    autoplay_on: {
      states: { grabbed: {}; released: TernaryWithAutoplay };
    };
    autoplay_off: {
      states: {
        grabbed: {};
        released: TernaryWaiting;
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
  boundaryThreshold?: number | string;
  transitionThreshold?: number | string;
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
