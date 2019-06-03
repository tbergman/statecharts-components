import * as React from "react";
import { StateChart } from "@statecharts/xstate-viz";
import { carouselMachineFactory } from "../machine";

const machine = carouselMachineFactory(6, 3);

export function Viz() {
  return (
    <div style={{ height: "100vh" }}>
      <StateChart machine={machine as any} withEditor={true} />;
    </div>
  );
}
