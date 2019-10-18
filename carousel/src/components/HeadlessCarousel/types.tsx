import { StateValue, State, EventObject } from "xstate";
import { Context } from "../../types";

export type ChildrenProps = {
  state: State<Context, EventObject>;
  data: Context;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  play: () => void;
  pause: () => void;
  grab: () => void;
  release: () => void;
  turnOn: () => void;
  turnOff: () => void;
  onTransition?: () => void;
};
