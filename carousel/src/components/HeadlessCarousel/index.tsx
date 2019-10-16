import { useEffect } from "react";
import { useMachine } from "@xstate/react";
import { carouselMachineFactory } from "../../machine/factory";
import { CarouselEvent, Context, HeadlessCarouselProps } from "../../types";
import { noop } from "../../utils";
import { EventObject } from "xstate";
import { ChildrenProps } from "./types";

export function HeadlessCarousel(
  props: HeadlessCarouselProps & {
    children: (childProps: ChildrenProps) => JSX.Element;
  },
) {
  const { onTransition = noop, onEvent = noop } = props;
  const [state, sendEvent, service] = useMachine<any, EventObject>(
    carouselMachineFactory(props).withConfig({
      delays: {
        AUTOPLAY: props.autoPlay || 2000,
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
    "GRAB",
    "RELEASE",
    "AUTOPLAY_ON",
    "AUTOPLAY_OFF",
  ];

  useEffect(() => {
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
    grab: () => {
      sendEvent({ type: "GRAB" });
    },
    release: () => {
      sendEvent("RELEASE");
    },
    turnOn: () => {
      sendEvent("AUTOPLAY_ON");
    },
    turnOff: () => {
      sendEvent("AUTOPLAY_OFF");
    },
  });
}
