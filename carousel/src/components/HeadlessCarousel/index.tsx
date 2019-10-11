import React from "react";
import { useMachine } from "@xstate/react";
import { carouselMachineFactory } from "../../machine/factory";
import {
  CarouselType,
  CarouselEvent,
  Context,
  HeadlessCarouselProps,
} from "../../types";
import { getCarouselType, noop } from "../../utils";
import { StateValue, EventObject } from "xstate";

type ChildrenProps<T> = {
  state: StateValue;
  data: T;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  play: () => void;
  pause: () => void;
  type: CarouselType;
  onTransition?: () => void;
};

export function HeadlessCarousel(
  props: HeadlessCarouselProps & {
    children: (childProps: ChildrenProps<Context>) => JSX.Element;
  },
) {
  const {
    totalItems,
    slidesToShow,
    onTransition = noop,
    onEvent = noop,
  } = props;
  const type = getCarouselType(totalItems, slidesToShow);
  const [state, sendEvent, service] = useMachine<any, EventObject>(
    carouselMachineFactory(props).withConfig({
      delays: {
        ...(props.autoPlay && { AUTOPLAY: props.autoPlay }),
        TRANSITION_DELAY: props.transitionDelay || 350,
      },
    }),
  );
  const externalEvents: CarouselEvent[] = [
    "NEXT",
    "PREV",
    "GO_TO",
    "PLAY",
    "PAUSE",
  ];

  React.useEffect(() => {
    service.onEvent(evt => {
      const type = evt.type as CarouselEvent;
      if (externalEvents.includes(type)) {
        onEvent(type);
      }
    });
    service.onTransition(state => {
      if (state.changed) {
        const type = state.event.type as CarouselEvent;
        if (externalEvents.includes(type)) {
          onTransition();
        }
      }
    });
  }, []);

  return props.children({
    state: state.value,
    data: state.context,
    next: () => {
      sendEvent({ type: "NEXT" });
    },
    prev: () => {
      sendEvent({ type: "PREV" });
    },
    goTo: index => {
      sendEvent({ type: "GO_TO", data: index });
    },
    play: () => {
      sendEvent({ type: "PLAY" });
    },
    pause: () => {
      sendEvent({ type: "PAUSE" });
    },
    type,
  });
}
