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
    <div>
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
    items: getRange(3).map((value, idx) => (
      <h3
        style={{
          height: 200,
          backgroundColor: "teal",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 50,
          margin: 0,
          fontFamily: "monospace"
        }}
        key={idx}
      >
        {value}
      </h3>
    )),
    totalItems: 3,
    startIndex: 2,
    dir: "ltr",
    autoPlay: 1500,
    infinite: true
  },
  {
    items: getRange(1).map((value, idx) => (
      <p
        style={{
          height: 50,
          backgroundColor: "red",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 20,
          margin: 0,
          fontFamily: "monospace"
        }}
        key={idx}
      >
        {value}
      </p>
    )),
    totalItems: 1,
    startIndex: 1,
    dir: "ltr",
    infinite: true
  },
  {
    items: getRange(2).map((value, idx) => (
      <p
        style={{
          height: 50,
          backgroundColor: "red",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 20,
          fontFamily: "monospace"
        }}
        key={idx}
      >
        {value}
      </p>
    )),
    totalItems: 2,
    startIndex: 1,
    dir: "ltr",
    infinite: true
  },
  {
    items: getRange(11).map((value, idx) => (
      <p
        style={{
          height: 50,
          backgroundColor: "red",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 20,
          fontFamily: "monospace"
        }}
        key={idx}
      >
        {value}
      </p>
    )),
    totalItems: 11,
    slidesToShow: 3,
    startIndex: 1,
    autoPlay: 3000,
    infinite: true,
    dir: "rtl"
  },
  {
    items: getRange(10).map((value, idx) => (
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
        key={idx}
      >
        {value}
      </span>
    )),
    totalItems: 10,
    startIndex: 9,
    slidesToShow: 3,
    dir: "rtl",
    infinite: true
  },
  {
    items: getRange(7)
      .map(i => `https://picsum.photos/900/300?random=${i}}`)
      .map((src, idx) => <img src={src} alt={src} key={idx} />),
    totalItems: 7,
    startIndex: 2,
    slidesToShow: 2,
    autoPlay: 2000,
    infinite: true
  },
  {
    items: getRange(5)
      .map(i => `https://picsum.photos/900/300?random=${i}}`)
      .map((src, idx) => <img src={src} alt={src} key={idx} />),
    totalItems: 5,
    startIndex: 1,
    slidesToShow: 3,
    autoPlay: 500,
    infinite: true
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
