import React from "react";
import { App as DefaultApp, StateChart } from "@statecharts/xstate-viz";
import { Machine } from "xstate";
import { Carousel } from "../Carousel";
import { getRange } from "../utils";
import {
  carouselMachineFactory,
  CarouselMachineFactoryConfig,
} from "../machine/factory";

const settings: CarouselMachineFactoryConfig = {
  totalItems: 10,
  slidesToShow: 5,
  dir: "ltr",
  infinite: true,
  startIndex: 1,
};

export function Viz() {
  return (
    <StateChart machine={carouselMachineFactory(settings)} onSave={() => {}} />
  );
}
