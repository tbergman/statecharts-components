import { StateValue } from "xstate";
import { Context } from "../../types";

export type ChildrenProps = {
  state: StateValue;
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
