import * as React from "react";
import { App } from "./pages/App";
import { Viz } from "./pages/Viz";

export function Router() {
  const url = window.location.pathname;
  switch (url) {
    case "/__viz":
      return <Viz />;
    case "/":
    case "":
      return <App />;
    default:
      throw Error(`unimplemented route ${url}`);
  }
}
