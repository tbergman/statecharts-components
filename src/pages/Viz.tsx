import * as React from "react";
import { StateChart } from "@statecharts/xstate-viz";
import { machine } from "../machine";

export function Viz() {
  return (
    <div style={{ height: "100vh" }}>
      <StateChart machine={machine as any} withEditor={true} />;
    </div>
  );
}
