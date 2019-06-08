import * as React from "react";
import { StateChart } from "@statecharts/xstate-viz";
import { carouselMachineFactory } from "../machine/factory";
import { defaultConfig } from "../machine/config";

const settings = {
  ...defaultConfig,
  ...{
    totalItems: 7,
    startIndex: 2,
    slidesToShow: 2,
    autoPlay: 2000,
    infinite: true
  }
};
const machine = carouselMachineFactory(settings);

export function Viz() {
  return (
    <div style={{ height: "100vh" }}>
      <StateChart machine={machine as any} withEditor={true} />;
    </div>
  );
}
