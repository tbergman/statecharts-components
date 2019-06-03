import * as React from "react";
import { useMachine } from "@xstate/react";
import { carouselMachineFactory } from "../machine";

const machine1 = carouselMachineFactory(6, 6);
const machine2 = carouselMachineFactory(12, 2);
const items1 = [
  { value: "1", id: 1 },
  { value: "2", id: 2 },
  { value: "3", id: 3 },
  { value: "4", id: 4 },
  { value: "5", id: 5 },
  { value: "6", id: 6 }
];

const items2 = [
  { value: "1", id: 1 },
  { value: "2", id: 2 },
  { value: "3", id: 3 },
  { value: "4", id: 4 },
  { value: "5", id: 5 },
  { value: "6", id: 6 },
  { value: "7", id: 7 },
  { value: "8", id: 8 },
  { value: "9", id: 9 },
  { value: "10", id: 10 },
  { value: "11", id: 11 },
  { value: "12", id: 12 }
];

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

export function App() {
  const [state1, sendEvent1] = useMachine(machine1);
  const [state2, sendEvent2] = useMachine(machine2);

  return (
    <>
      <div style={listStyle}>
        {items1.map(item1 => (
          <div
            style={{
              ...itemStyle,
              backgroundColor:
                state1.context.cursor === item1.id ? "orange" : "#eee"
            }}
            key={item1.id}
            onClick={() => sendEvent1({ type: "GO_TO", data: item1.id })}
          >
            {item1.value}
          </div>
        ))}
      </div>
      <div style={dotListStyle}>
        {items1.map(item1 => (
          <div
            style={{
              ...dotStyle,
              backgroundColor:
                state1.context.cursor === item1.id ? "orange" : "#ddd"
            }}
            key={item1.id}
            onClick={() => sendEvent1({ type: "GO_TO", data: item1.id })}
          />
        ))}
      </div>
      <div>
        <button
          onClick={() => {
            sendEvent1({ type: "NEXT" });
          }}
        >
          Next
        </button>
        <button
          onClick={() => {
            sendEvent1({ type: "PREV" });
          }}
        >
          Prev
        </button>
      </div>
      {/*  */}
      <div style={listStyle}>
        {items2.map(item2 => (
          <div
            style={{
              ...itemStyle,
              backgroundColor:
                state2.context.cursor === item2.id ? "orange" : "#eee"
            }}
            key={item2.id}
            onClick={() => sendEvent2({ type: "GO_TO", data: item2.id })}
          >
            {item2.value}
          </div>
        ))}
      </div>
      <div style={dotListStyle}>
        {items2.map(item2 => (
          <div
            style={{
              ...dotStyle,
              backgroundColor:
                state2.context.cursor === item2.id ? "orange" : "#ddd"
            }}
            key={item2.id}
            onClick={() => sendEvent2({ type: "GO_TO", data: item2.id })}
          />
        ))}
      </div>
      <div>
        <button
          onClick={() => {
            sendEvent2({ type: "NEXT" });
          }}
        >
          Next
        </button>
        <button
          onClick={() => {
            sendEvent2({ type: "PREV" });
          }}
        >
          Prev
        </button>
      </div>
    </>
  );
}
