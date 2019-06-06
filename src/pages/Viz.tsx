import * as React from "react";
import { StateChart } from "@statecharts/xstate-viz";
import { carouselMachineFactory } from "../machine";

const machine = carouselMachineFactory({
  totalItems: 1,
  startIndex: 1,
  dir: "ltr",
  autoPlay: 500,
  infinite: false
});

export function Viz() {
  return (
    <div style={{ height: "100vh" }}>
      <StateChart machine={machine as any} withEditor={true} />;
    </div>
  );
}
