import * as React from "react";
import { useMachine } from "@xstate/react";
import { carouselMachineFactory } from "./machine";
import { useEffect } from "react";
import { Dir } from "./types";
import "./Carousel.css";

export type CarouselProps = {
  items: JSX.Element[];
  totalItems: number;
  startIndex?: number;
  autoPlay?: number;
  dir?: Dir;
  infinite?: boolean;
};
export function Carousel({
  items,
  totalItems,
  startIndex = 1,
  autoPlay,
  dir = "ltr",
  infinite = false
}: CarouselProps) {
  const [state, sendEvent, service] = useMachine(
    carouselMachineFactory({
      totalItems,
      startIndex,
      autoPlay,
      dir,
      infinite
    })
  );
  useEffect(() => {
    // service.onTransition(state => {
    //   console.log(state.value, state.context);
    // });
  }, [service]);
  return (
    <div style={{ maxWidth: 764, margin: "0 auto" }}>
      <div className="items-list">
        <div
          className="items-track"
          style={{
            width: totalItems * 764,
            transform: `translate3d(${(state.context.cursor - 1) *
              -764}px, 0, 0)`
          }}
        >
          {items.map((item, idx) => (
            <div
              className="item"
              style={{ width: 764 }}
              key={item.key || idx}
              onClick={() => sendEvent({ type: "GO_TO", data: idx + 1 })}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          sendEvent({ type: "NEXT" });
        }}
      >
        Next
      </button>
      <button
        onClick={() => {
          sendEvent({ type: "PREV" });
        }}
      >
        Prev
      </button>
    </div>
  );
}
