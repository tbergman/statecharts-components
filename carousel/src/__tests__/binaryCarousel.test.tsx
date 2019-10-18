import { binaryCarouselMachine } from "../machines/binaryMachine";
import { interpret, StateMachine, EventObject, Interpreter } from "xstate";
import { BinaryContext, BinaryCarouselStateSchema } from "../types";

type I = Interpreter<BinaryContext, BinaryCarouselStateSchema, EventObject>;
type M = StateMachine<BinaryContext, BinaryCarouselStateSchema, EventObject>;

function machineToService<C, SS, E extends EventObject>(
  machine: StateMachine<C, SS, E>,
): Interpreter<C, SS, E> {
  return interpret(machine).start();
}

function waitForCarouselTransition(service: I, callback: () => void) {
  setTimeout(
    () => {
      callback();
    },
    service.machine.options.delays.TRANSITION_DELAY as number,
  );
}

describe("Binary Carousel", () => {
  describe("default behaviour", () => {
    let service: I;
    beforeEach(() => {
      service = machineToService(
        binaryCarouselMachine({
          totalItems: 3,
          slidesToShow: 2,
          startIndex: 1,
          infinite: false,
          dir: "ltr",
        }),
      );
    });
    it("should show 1 slide per group", () => {
      expect(
        service.state.context.groups.map(g => g.length).every(l => l === 1),
      );
    });
    it("should start from the 1st item", () => {
      expect(service.state.context.cursor === 1).toBe(true);
    });
    it("should move in LTR direction", () => {
      // starts from first
      // Go to last
      service.send({ type: "NEXT" });
      waitForCarouselTransition(service, () => {
        expect(service.state.context.cursor === 2).toBe(true);
      });
      // Go back to first
      service.send({ type: "PREV" });
      waitForCarouselTransition(service, () => {
        expect(service.state.context.cursor === 1).toBe(true);
      });
    });
    it("should not circle from last to first", () => {
      // starts from first
      // Go to last
      service.send({ type: "NEXT" });
      // Stay at last because it's not infinite
      service.send({ type: "NEXT" });
      waitForCarouselTransition(service, () => {
        expect(service.state.context.cursor === 2).toBe(true);
        expect(service.state.matches({ waiting: "last" })).toBe(true);
      });
    });
    it("should not circle back first to last", () => {
      // starts from first
      // Stay at first because it's not infinite
      service.send({ type: "PREV" });
      expect(service.state.context.cursor === 1).toBe(true);
      waitForCarouselTransition(service, () => {
        expect(service.state.matches({ waiting: "last" })).toBe(true);
      });
    });
    it("should not autoPlay by default", () => {
      expect(service.machine.options.delays.AUTOPLAY).toBe(undefined);
    });
  });
  /**
   * Edge cases:
   * dir: LTR | RTL
   * infinite: true | false
   * slidesToShow: 1 | totalItems
   * autoplay: undefined | 2000
   *
   */
  describe("LTR machine", () => {});
  describe("RTL machine", () => {});
});
