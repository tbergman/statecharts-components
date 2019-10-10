import React, { useState } from "react";
import { useMachine } from "@xstate/react";
import { carouselMachineFactory } from "../../machine/factory";
import {
  CarouselType,
  CarouselEvent,
  TernaryContext,
  HeadlessCarouselProps,
} from "../../types";
import { getCarouselType } from "../../utils";
import { StateValue } from "xstate";

type ChildrenProps<T> = {
  state: StateValue;
  data: T;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  play: () => void;
  pause: () => void;
  type: CarouselType;
  //   onTransition?: (state: State<CarouselContext, CarouselEvent>) => void;
};

export function HeadlessCarousel<TContext>(
  props: HeadlessCarouselProps & {
    children: (childProps: ChildrenProps<TernaryContext>) => JSX.Element;
  },
) {
  const { totalItems, slidesToShow } = props;
  const type = getCarouselType(totalItems, slidesToShow);
  const [state, sendEvent, service] = useMachine<any, CarouselEvent>(
    carouselMachineFactory(props).withConfig({
      delays: {
        ...(props.autoPlay && { AUTOPLAY: props.autoPlay }),
        TRANSITION_DELAY: props.transitionDelay || 350,
      },
    }),
  );

  function isDelayedEvent(type: string) {
    return type.includes("xstate.after");
  }

  React.useEffect(() => {
    service.onEvent(evt => {
      console.log(
        `${(JSON.stringify(service.state.value)
          .split(":")
          .pop() as string).replace(/}/g, "")} , ${(JSON.stringify(state.value)
          .split(":")
          .pop() as string).replace(/}/g, "")}, ${
          !isDelayedEvent(evt.type)
            ? evt.type
            : (evt.type.match(/\(.+\)/) as RegExpMatchArray)[0]
        }`,
      );
    });
    service.onTransition(state => {
      if (state.changed) {
        // console.log(state.value);
        // console.log(state.nextEvents);
        // console.log(state.context);
        // console.log(state.value);
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
