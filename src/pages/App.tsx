import * as React from "react";
import { Carousel, CarouselProps } from "../Carousel";
import { getRange } from "../utils";

function DemoSection({
  config,
  children
}: {
  config: CarouselProps;
  children: React.ReactNode;
}) {
  const { items, ...restConfig } = config;
  return (
    <div style={{ padding: 15, border: "1px dotted" }}>
      <h3>
        <pre style={{ backgroundColor: "#eee", display: "block", padding: 5 }}>
          {JSON.stringify(restConfig, null, 2)}
        </pre>
      </h3>
      {children}
    </div>
  );
}

const carousels: CarouselProps[] = [
  {
    items: getRange(7).map(i => (
      <span
        style={{
          height: 100,
          backgroundColor: "orange",
          color: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 50,
          margin: 0,
          fontFamily: "monospace"
        }}
        key={i}
      >
        {i}
      </span>
    )),
    totalItems: 1,
    startIndex: 1,
    slidesToShow: 2,
    slidesToScroll: 2,
    dir: "rtl",
    infinite: false
  }
];

export function App() {
  return (
    <div style={{ margin: 30 }}>
      {carousels
        .slice()
        .reverse()
        .map((c, i) => {
          return (
            <DemoSection config={c} key={i}>
              <Carousel {...c} />
            </DemoSection>
          );
        })}
    </div>
  );
}
