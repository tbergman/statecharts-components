import { HeadlessCarouselProps, CarouselEvent, Context } from "../../types";
import { ChildrenProps } from "./types";
import { noop } from "../../utils";
import { carouselMachineFactory } from "../../machine/factory";
import { useMachine } from "@xstate/react";
import { EventObject } from "xstate";
import { useEffect } from "react";

export function useCarousel(props: HeadlessCarouselProps): ChildrenProps {
  const { onTransition = noop, onEvent = noop } = props;
  const [state, sendEvent, service] = useMachine<Context, EventObject>(
    carouselMachineFactory(props).withConfig({
      delays: {
        ...(props.autoPlay && { AUTOPLAY: props.autoPlay }),
        TRANSITION_DELAY: props.transitionDelay || 350,
      },
    }),
  );

  useEffect(() => {
    console.log(service.machine.config);
  }, []);

  const externalEvents: CarouselEvent[] = [
    "NEXT",
    "PREV",
    "GO_TO",
    "PLAY",
    "PAUSE",
    "GRAB",
    "RELEASE",
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

  return {
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
  };
}
