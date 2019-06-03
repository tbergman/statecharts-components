import * as React from "react";
import { useMachine } from "@xstate/react";
import { machine } from "../machine";

const listStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-evenly",
  padding: "15px 0"
};
const itemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: 200,
  height: 200,
  backgroundColor: "#eee",
  fontSize: 25,
  fontWeight: "bold",
  fontFamily: "Helvetica"
};
const dotListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  padding: "15px 0",
  width: 100,
  margin: "0 auto"
};
const dotStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  backgroundColor: "#ddd",
  borderRadius: "50%",
  cursor: "pointer"
};

export function App() {
  const [state, sendEvent] = useMachine(machine);
  const items = [
    { value: "1", id: 1 },
    { value: "2", id: 2 },
    { value: "3", id: 3 },
    { value: "4", id: 4 },
    { value: "5", id: 5 }
  ];
  return (
    <>
      <div style={listStyle}>
        {items.map(item => (
          <div
            style={{
              ...itemStyle,
              backgroundColor:
                state.context.cursor === item.id ? "orange" : "#eee"
            }}
            key={item.id}
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
                state.context.cursor === item.id ? "orange" : "#ddd"
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
