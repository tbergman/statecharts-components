import React from "react";
import { useMachine } from "@xstate/react";
import { carouselMachineFactory } from "../../machine/factory";
import { CarouselContext, CarouselType, CarouselProps, Dir } from "../../types";
import { getCarouselType } from "../../utils";
import { StateValue } from "xstate";

type ChildrenProps = {
  state: StateValue;
  data: CarouselContext;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  play: () => void;
  pause: () => void;
  type: CarouselType;
  //   onTransition?: (state: State<CarouselContext, CarouselEvent>) => void;
};
type HeadlessCarouselProps = CarouselProps & {
  startIndex: number;
  slidesToShow: number;
  infinite: boolean;
  dir: Dir;
};

export function HeadlessCarousel(
  props: HeadlessCarouselProps & {
    children: (childProps: ChildrenProps) => JSX.Element;
  },
) {
  const { totalItems, slidesToShow } = props;
  const type = getCarouselType(totalItems, slidesToShow);
  const machine = carouselMachineFactory(props);
  const [state, sendEvent] = useMachine(machine);

  //   React.useEffect(() => {
  //     service.onTransition(state => {
  //       if (state.changed) {
  //         console.log(state.value);
  //         // console.log(state.nextEvents);
  //         console.log(state.context);
  //       }
  //     });
  //   }, [service]);

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
