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
    <div style={{ padding: 15, border: "1px dotted", marginTop: 15 }}>
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
    items: getRange(2).map(i => (
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
    totalItems: 2,
    startIndex: 1,
    slidesToScroll: 2,
    dir: "rtl",
    infinite: true
  },
  {
    items: getRange(2).map(i => (
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
    totalItems: 2,
    startIndex: 1,
    slidesToScroll: 1,
    dir: "ltr",
    infinite: true
  },
  {
    items: getRange(2).map(i => (
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
    totalItems: 2,
    startIndex: 1,
    slidesToScroll: 2,
    dir: "rtl",
    infinite: false
  },
  {
    items: getRange(10).map(i => (
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
    totalItems: 10,
    startIndex: 1,
    slidesToShow: 3,
    slidesToScroll: 5,
    dir: "ltr",
    infinite: true
  },
  {
    items: getRange(10).map(i => (
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
    totalItems: 10,
    startIndex: 1,
    slidesToShow: 3,
    slidesToScroll: 4,
    dir: "rtl",
    infinite: true
  }
];

export function App() {
  return (
    <div style={{ margin: 30 }}>
      {carousels.slice().map((c, i) => {
        return (
          <DemoSection config={c} key={i}>
            <Carousel {...c} />
          </DemoSection>
        );
      })}
    </div>
  );
}
