import { HeadlessCarouselProps, CarouselEvent, Context } from "../../types";
import { ChildrenProps } from "./types";
import { noop } from "../../utils";
import { carouselMachineFactory } from "../../machines/factory";
import { useMachine } from "@xstate/react";
import { EventObject } from "xstate";
import { useEffect } from "react";

export function useCarousel(props: HeadlessCarouselProps): ChildrenProps {
  const { onTransition = noop, onEvent = noop } = props;
  const [state, sendEvent, service] = useMachine<Context, EventObject>(
    // Machine will always have autoplay. a machine with no autoply is a machine that hasn't been turned on yet.
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
    console.log(service.machine.options);
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

  return {
    state: state,
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
  };
}
