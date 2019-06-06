import * as React from "react";
import { useMachine } from "@xstate/react";
import { carouselMachineFactory } from "./machine";
import { State } from "xstate";
import { useEffect } from "react";
import { Dir } from "./types";

const listStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  padding: "15px 0",
  height: 200
};
const itemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#eee",
  fontSize: 25,
  fontWeight: "bold",
  fontFamily: "Helvetica",
  flexGrow: 1,
  margin: "0 5px",
  cursor: "pointer"
};
const dotListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  padding: "15px 0",
  width: 200,
  margin: "0 auto"
};
const dotStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  backgroundColor: "#ddd",
  borderRadius: "50%",
  cursor: "pointer"
};

export function Carousel({
  items,
  startIndex = 1,
  autoPlay,
  dir = "ltr",
  infinite = false
}: {
  items: { value: string; id: number }[];
  startIndex?: number;
  autoPlay?: number;
  dir?: Dir;
  infinite?: boolean;
}) {
  const [state, sendEvent, service] = useMachine(
    carouselMachineFactory({
      totalItems: items.length,
      startIndex,
      autoPlay,
      dir,
      infinite
    })
  );
  // console.log(state);
  useEffect(() => {
    // service.onTransition(state => {
    //   console.log(state.value, state.context);
    // });
  }, [service]);
  return (
    <>
      <div style={listStyle}>
        {items.map(item => (
          <div
            style={{
              ...itemStyle,
              backgroundColor:
                (state as State<any>).context.cursor === item.id
                  ? "orange"
                  : "#eee"
            }}
            key={item.id}
            onClick={() => sendEvent({ type: "GO_TO", data: item.id })}
          >
            {item.value}
          </div>
        ))}
      </div>
      <div style={dotListStyle}>
        {items.map(item => (
          <div
            style={{
              ...dotStyle,
              backgroundColor:
                (state as State<any, any>).context.cursor === item.id
                  ? "orange"
                  : "#ddd"
            }}
            key={item.id}
            onClick={() => sendEvent({ type: "GO_TO", data: item.id })}
          />
        ))}
      </div>
      <div>
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
    </>
  );
}
